package song.processing.utils;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.List;
import java.lang.RuntimeException;

import org.vamp_plugins.PluginLoader;
import org.vamp_plugins.Plugin;
import org.vamp_plugins.ParameterDescriptor;
import org.vamp_plugins.OutputDescriptor;
import org.vamp_plugins.Feature;
import org.vamp_plugins.RealTime;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import song.processing.Notes;
import song.processing.common.FunctionsEnum;

import javax.sound.sampled.AudioSystem;
import javax.sound.sampled.AudioInputStream;
import javax.sound.sampled.AudioFormat;
import javax.sound.sampled.UnsupportedAudioFileException;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

public class Host {


    private static void printNotes(String filename, RealTime frameTime, Integer output,
                                   Map<Integer, List<Feature>> features, File xmlFile)  {
        int midiValue;

        if (!features.containsKey(output)) return;

        System.out.print("\tSaving xml file...");
        try {
            // Stuff for xml
            DocumentBuilderFactory documentFactory = DocumentBuilderFactory.newInstance();
            DocumentBuilder documentBuilder = documentFactory.newDocumentBuilder();
            Document document = documentBuilder.newDocument();

            Element root = document.createElement(filename);
            document.appendChild(root);


            // processing .wav file data
            for (Feature f : features.get(output)) {
                Element note = document.createElement("note");

                if (f.hasTimestamp) {
                    Element timestamp = document.createElement("timestamp");
                    timestamp.appendChild(document.createTextNode(Helper.RealTime2String(f.timestamp, 2)));
                    note.appendChild(timestamp);
                } else {
                    Element frame = document.createElement("frame");
                    frame.appendChild(document.createTextNode(String.valueOf(frameTime)));
                    note.appendChild(frame);
                }
                if (f.hasDuration) {
                    Element duration = document.createElement("duration");
                    duration.appendChild(document.createTextNode(Helper.RealTime2String(f.duration, 2)));
                    note.appendChild(duration);
                }
                for (float v : f.values) {

                    // Zamiana częstotliwości na wartość nuty w midi
                    // https://stackoverflow.com/questions/27357727/calcute-note-based-on-frequency
                    midiValue = (int) (Math.round(69 + 12 * (Math.log(v / 440) / Math.log(2))));

                    Element val = document.createElement("value");
                    val.appendChild(document.createTextNode(String.valueOf(v)));
                    note.appendChild(val);

                    Element midi = document.createElement("midiValue");
                    midi.appendChild(document.createTextNode(String.valueOf(midiValue)));
                    note.appendChild(midi);

                    Element letterNote = document.createElement("letterNote");
                    letterNote.appendChild(document.createTextNode(Notes.note(midiValue)));
                    note.appendChild(letterNote);
                }

                root.appendChild(note);

                // create the xml file
                //transform the DOM Object to an XML File
                TransformerFactory transformerFactory = TransformerFactory.newInstance();
                Transformer transformer = transformerFactory.newTransformer();
                DOMSource domSource = new DOMSource(document);
                StreamResult streamResult = new StreamResult(xmlFile);

                transformer.transform(domSource, streamResult);
            }
            System.out.println(" OK!");
        } catch (ParserConfigurationException pce) {
            pce.printStackTrace();
        } catch (TransformerException tfe) {
            tfe.printStackTrace();
        }
    }

    private static void printSmoothedPitch(String filename, RealTime frameTime, Integer output,
                                           Map<Integer, List<Feature>> features, File file) throws IOException {
        if (!features.containsKey(output)) return;

        System.out.print(String.format("\tListing Smoothed Pitch Track to file %s.txt ...\n", filename));

        try {
            PrintWriter writer = new PrintWriter(file, "UTF-8");
            // processing .wav file data
            for (Feature f : features.get(output)) {
                if (f.hasTimestamp) {
                    writer.print(String.format("\n %s ", String.valueOf(f.timestamp)));
                } else {
                    writer.print(String.format(" %s ", String.valueOf(frameTime)));
                }
                if (f.hasDuration) {
                    writer.print(String.format(" %s ", String.valueOf(f.duration)));
                }
                for (float v : f.values) {

                    writer.print(String.format(" %s ", v));
                }
            }
            System.out.println(" OK!");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static void usage() {
        System.err.println("Usage: host pluginlibrary:plugin:output file.wav");
    }

    private static int readBlock(AudioFormat format, AudioInputStream stream,
                                 float[][] buffers)
            throws java.io.IOException {
        // 16-bit LE signed PCM only
        int channels = format.getChannels();
        byte[] raw = new byte[buffers[0].length * channels * 2];
        int read = stream.read(raw);
        if (read < 0) return read;
        int frames = read / (channels * 2);
        for (int i = 0; i < frames; ++i) {
            for (int c = 0; c < channels; ++c) {
                int ix = i * channels + c;
                int ival = (raw[ix * 2] & 0xff) | (raw[ix * 2 + 1] << 8);
                float fval = ival / 32768.0f;
                buffers[c][i] = fval;
            }
        }
        return frames;
    }


    private static void createPropertiesAndRdf(String filename,Path relativePathString,File file) throws Exception {

        Properties props = new Properties();
        OutputStream output = null;

        String[] relativePathSplitted = relativePathString.toString().split("\\\\");
        String tempPath="";
        boolean publicationRoot = true;
        boolean groupPub=true;

        for (String s : relativePathSplitted) {
            tempPath = tempPath + s + "\\";
            output = new FileOutputStream(tempPath + "\\" + "publication.properties");

            props.setProperty("publication.metadataFile", "metadata.rdf");
            props.setProperty("publication.name", filename);

            if (publicationRoot) {
                props.setProperty("publication.destination.directoryId", "1044");
                //  props.setProperty("publication.collections", "6");
                props.setProperty("publication.published", "true");

            }
            System.out.println(tempPath);
            System.out.println(relativePathString);
            if (tempPath.equals(relativePathString.toString() + "\\")) {
                groupPub=false;
                props.setProperty("publication.mainFile", filename + ".mp3");
            }

            publicationRoot = false;
            props.store(output, null);


            DocumentBuilderFactory documentFactory = DocumentBuilderFactory.newInstance();
            DocumentBuilder documentBuilder = documentFactory.newDocumentBuilder();
            Document document = documentBuilder.newDocument();

            Element root = document.createElement("RDF");
            document.appendChild(root);


            Element description = document.createElement("Description");
            root.appendChild(description);

            Element title = document.createElement("Title");
            title.appendChild(document.createTextNode(s));

            description.appendChild(title);
            if(groupPub) {
                String[] data = Helper.getDurationAndName(file);
                String dataString = "";

                if (data[0] != null) {
                    dataString += data[0] + "\n";
                }
                dataString += data[1];

                Element descriptionDuration = document.createElement("Description");
                descriptionDuration.appendChild(document.createTextNode(dataString));
                description.appendChild(descriptionDuration);

            }
            File rdfFile = new File(tempPath + "\\" + "metadata.rdf");

            TransformerFactory transformerFactory = TransformerFactory.newInstance();
            Transformer transformer = transformerFactory.newTransformer();
            DOMSource domSource = new DOMSource(document);
            StreamResult streamResult = new StreamResult(rdfFile);

            transformer.transform(domSource, streamResult);

        }


    }


    public static void start(FunctionsEnum function, File f, Path relativePath, File fileMp3) throws Exception {
        String key = null;
        System.out.println("[pYIN] Start processing " + f.getName());
        PluginLoader loader = PluginLoader.getInstance();
        String path;
        File xmlFile = null;
        File fileSmoothed = null;

        String relativePathString = relativePath.toString().split("\\.")[0] + "\\";
        String[] filenameSplitted = relativePathString.split("\\\\");
        String filename = filenameSplitted[filenameSplitted.length - 1];

        path = new File(".").getCanonicalPath();
        relativePathString = relativePath.toString().split("\\.")[0] + "\\";
        System.out.println(relativePathString);
        boolean createDirectory = new File(path + "\\" + relativePathString).mkdirs();

        File newmp3= new File (path + "\\" + relativePathString + filename + ".mp3"  );
        if (!newmp3.exists()) {
            Files.copy(fileMp3.toPath(),newmp3.toPath());
        }
        createPropertiesAndRdf(filename, Paths.get(relativePathString),fileMp3);


        switch (function) {
            case NOTES:
                key = "pyin:pyin:notes";

                xmlFile = new File(path + "\\" + relativePathString + filename + ".xml");
                break;
            case SMOOTHED_PITCH_TRACK:
                key = "pyin:pyin:smoothedpitchtrack";

                fileSmoothed = new File(path + "\\" + relativePathString +  filename + ".txt");
                break;
//            default:
//                throw new Exception();
        }

        String[] keyparts = key.split(":");
        if (keyparts.length < 3) {
            usage();
            return;
        }

        String pluginKey = keyparts[0] + ":" + keyparts[1];
        String outputKey = keyparts[2];

        try {

            AudioInputStream stream = AudioSystem.getAudioInputStream(f);
            AudioFormat format = stream.getFormat();

            if (format.getSampleSizeInBits() != 16 ||
                    format.getEncoding() != AudioFormat.Encoding.PCM_SIGNED ||
                    format.isBigEndian()) {
                System.err.println("Sorry, only 16-bit signed little-endian PCM files supported");
                return;
            }

            float rate = format.getFrameRate();
            int channels = format.getChannels();
            int bytesPerFrame = format.getFrameSize();
            int blockSize = 1024; // frames

            Plugin p = loader.loadPlugin
                    (pluginKey, rate, PluginLoader.AdapterFlags.ADAPT_ALL);

            OutputDescriptor[] outputs = p.getOutputDescriptors();
            int outputNumber = -1;
            for (int i = 0; i < outputs.length; ++i) {
                if (outputs[i].identifier.equals(outputKey)) outputNumber = i;
            }
            if (outputNumber < 0) {
                System.err.println("Plugin lacks output id: " + outputKey);
                System.err.print("Outputs are:");
                for (int i = 0; i < outputs.length; ++i) {
                    System.err.print(" " + outputs[i].identifier);
                }
                System.err.println("");
                return;
            }

            boolean b = p.initialise(channels, blockSize, blockSize);
            if (!b) {
                System.err.println("Plugin initialise failed");
                return;
            }

            float[][] buffers = new float[channels][blockSize];

            boolean done = false;
            boolean incomplete = false;
            int block = 0;

            while (!done) {

                for (int c = 0; c < channels; ++c) {
                    for (int i = 0; i < blockSize; ++i) {
                        buffers[c][i] = 0.0f;
                    }
                }

                int read = readBlock(format, stream, buffers);

                if (read < 0) {
                    done = true;
                } else {

                    if (incomplete) {
                        // An incomplete block is only OK if it's the
                        // last one -- so if the previous block was
                        // incomplete, we have trouble
                        System.err.println("Audio file read incomplete! Short buffer detected at " + block * blockSize);
                        return;
                    }

                    incomplete = (read < buffers[0].length);

                    RealTime timestamp = RealTime.frame2RealTime
                            (block * blockSize, (int) (rate + 0.5));

                    Map<Integer, List<Feature>>
                            features = p.process(buffers, timestamp);

                    switch (function) {
                        case NOTES:
                            printNotes(filename, timestamp, outputNumber, features, xmlFile);
                            break;
                        case SMOOTHED_PITCH_TRACK:
                            printSmoothedPitch("smoothed_" + filename, timestamp, outputNumber, features, fileSmoothed);
                            break;
                    }
                }

                ++block;
            }

            Map<Integer, List<Feature>>
                    features = p.getRemainingFeatures();

            RealTime timestamp = RealTime.frame2RealTime
                    (block * blockSize, (int) (rate + 0.5));
            switch (function) {
                case NOTES:
                    printNotes(filename, timestamp, outputNumber, features, xmlFile);
                    break;
                case SMOOTHED_PITCH_TRACK:
                    printSmoothedPitch("smoothed_" + filename, timestamp, outputNumber, features, fileSmoothed);
                    break;
            }

            p.dispose();
            System.out.println("...Done!");
        } catch (java.io.IOException e) {
            System.err.println("Failed to read audio file: " + e.getMessage());

        } catch (javax.sound.sampled.UnsupportedAudioFileException e) {
            System.err.println("Unsupported audio file format: " + e.getMessage());

        } catch (PluginLoader.LoadFailedException e) {
            System.err.println("Plugin load failed (unknown plugin?): key is " +
                    key);
        }
    }
}