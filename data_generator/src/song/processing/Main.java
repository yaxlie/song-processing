package song.processing;

import org.vamp_plugins.Plugin;
import org.vamp_plugins.PluginLoader;
import song.processing.common.FunctionsEnum;
import song.processing.utils.Host;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.util.List;

import javazoom.jl.converter.Converter;
import javazoom.jl.decoder.JavaLayerException;

import static java.util.stream.Collectors.toList;

public class Main {
    private static final boolean smoothed_pitch = true;

    public static void main(String[] args) {

        try {
            Plugin pyin = PluginLoader.getInstance().loadPlugin("pyin:pyin", 1, 1);
            System.out.println();
            System.out.println(pyin.getDescription());

            List<Path> pathsToCheckList;

            for (String path : args) {
                if (path.substring(path.length() - 1).equals("\\")) {
                    path = path.substring(0, path.length() - 1);
                }

                pathsToCheckList = Files.walk(Paths.get(path))
                        .filter(s -> s.toString().endsWith(".mp3"))
                        .collect(toList());

                for (Path fileName : pathsToCheckList) {
                    File fileMp3 = new File(String.valueOf(fileName));
                    File fileWav = convertMP3toWAV(fileMp3);
                    Path relativePath = (Paths.get(path)).getParent().relativize(fileName);

                    Host.start(FunctionsEnum.NOTES, fileWav, relativePath, fileMp3);

                    if (smoothed_pitch) {
                        Host.start(FunctionsEnum.SMOOTHED_PITCH_TRACK, fileWav, relativePath,fileMp3);
                    }
                }

            }
        } catch (Exception e) {
            System.err.println(e.toString());
        }
    }

    private static File convertMP3toWAV(File fileMp3) {
        File temp = null;
        try {
            temp = File.createTempFile("temp_" + fileMp3.getName().split("\\.")[0], ".wav");
            temp.deleteOnExit();
        } catch (IOException e1) {
            e1.printStackTrace();
        }
        Converter converter = new Converter();
        try {
            converter.convert(fileMp3.getAbsolutePath(), temp.getAbsolutePath());
        } catch (JavaLayerException e) {
            e.printStackTrace();
        }
        return temp;
    }

}
