package song.processing;

import org.vamp_plugins.Plugin;
import org.vamp_plugins.PluginLoader;
import song.processing.common.FunctionsEnum;
import song.processing.utils.Host;

import java.io.File;
import java.io.IOException;

import javazoom.jl.converter.Converter;
import javazoom.jl.decoder.JavaLayerException;

public class Main {
    private static final boolean smoothed_pitch = true;

    public static void main(String[] args) {

        try {
            Plugin pyin = PluginLoader.getInstance().loadPlugin("pyin:pyin", 1, 1);
            System.out.println();
            System.out.println(pyin.getDescription());
            for (String fileName : args) {
                File fileMp3 = new File(fileName);
                File fileWav = convertMP3toWAV(fileMp3);
                // Host.start("pyin:pyin:Smoothed Pitch Track", fileWav); // zwraca listę dostępnych funkcji
                Host.start(FunctionsEnum.NOTES, fileWav);

                if(smoothed_pitch){
                    Host.start(FunctionsEnum.SMOOTHED_PITCH_TRACK, fileWav);
                }

            }
        } catch (Exception e) {
            System.err.println(e.toString());
        }
    }

    public static File convertMP3toWAV(File fileMp3) {
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
