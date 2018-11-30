package song.processing.utils;

import java.io.PrintWriter;
import java.nio.file.Path;
import java.util.List;
import java.util.TreeMap;
import java.util.Map;
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

import java.io.File;
import java.io.IOException;

public class Host {
    private static void printNotes(String filename, RealTime frameTime, Integer output,
                                   Map<Integer, List<Feature>> features, Path relativePath) throws IOException {
        int midiValue;
        String path = new File(".").getCanonicalPath();
        String relativePathString = relativePath.toString().split("\\.")[0] + "\\";
        boolean reateDirectory = new File(path + "\\" + relativePathString + "XML\\").mkdirs();


        File xmlFile = new File(path + "\\" + relativePathString + "XML\\" + filename + ".xml");


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
                    timestamp.appendChild(document.createTextNode(String.valueOf(f.timestamp)));
                    note.appendChild(timestamp);
                } else {
                    Element frame = document.createElement("frame");
                    frame.appendChild(document.createTextNode(String.valueOf(frameTime)));
                    note.appendChild(frame);
                }
                if (f.hasDuration) {
                    Element duration = document.createElement("duration");
                    duration.appendChild(document.createTextNode(String.valueOf(f.duration)));
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
                                           Map<Integer, List<Feature>> features, Path relativePath) throws IOException {
        if (!features.containsKey(output)) return;

        System.out.print(String.format("\tListing Smoothed Pitch Track to file %s.txt ...\n", filename));
        String path = new File(".").getCanonicalPath();
        String relativePathString = relativePath.toString().split("\\.")[0] + "\\";
        boolean fileCreate = new File(path + "\\" + relativePathString + "TXT\\").mkdirs();
        File file = new File(path + "\\" + relativePathString + "TXT\\" + filename + ".txt");
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

    public static void start(FunctionsEnum function, File f, Path relativePath) {
        String key = null;
        System.out.println("[pYIN] Start processing " + f.getName());
        PluginLoader loader = PluginLoader.getInstance();

        String relativePathString = relativePath.toString().split("\\.")[0] + "\\";
        String[] filenameSplitted = relativePathString.split("\\\\");
        String filename = filenameSplitted[filenameSplitted.length - 1];

        switch (function) {
            case NOTES:
                key = "pyin:pyin:notes";
                break;
            case SMOOTHED_PITCH_TRACK:
                key = "pyin:pyin:smoothedpitchtrack";
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
                            printNotes(filename, timestamp, outputNumber, features, relativePath);
                            break;
                        case SMOOTHED_PITCH_TRACK:
                            printSmoothedPitch("smoothed_" + filename, timestamp, outputNumber, features, relativePath);
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
                    printNotes(filename, timestamp, outputNumber, features, relativePath);
                    break;
                case SMOOTHED_PITCH_TRACK:
                    printSmoothedPitch("smoothed_" + filename, timestamp, outputNumber, features, relativePath);
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