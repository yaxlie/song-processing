package song.processing;

import org.vamp_plugins.Plugin;
import org.vamp_plugins.PluginLoader;
import song.processing.utils.Host;


public class Main {

    public static void main(String[] args) {

        try {
            Plugin pyin = PluginLoader.getInstance().loadPlugin("pyin:pyin", 1, 1);

            System.out.println(pyin.getDescription());
            song.processing.utils.Host host = new Host();
            host.start("pyin:pyin:notes", "./res/01.wav");
            System.out.println("done");
        } catch (Exception e) {
            System.err.println(e.toString());
        }
    }
}
