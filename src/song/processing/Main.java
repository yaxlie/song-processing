package song.processing;

import org.vamp_plugins.Plugin;
import org.vamp_plugins.PluginLoader;

import java.util.Arrays;

public class Main {

    public static void main(String[] args) {
        try {


            System.out.println("Plugins path: " + Arrays.toString(PluginLoader.getInstance().getPluginPath()));
            System.out.println("Plugins list: " + Arrays.toString(PluginLoader.getInstance().listPlugins()));

            Plugin pyin = PluginLoader.getInstance().loadPlugin("pyin:pyin", 1, 1);

            // Do the stuff
            System.out.println("Pyin desc: " + pyin.getDescription());

            pyin.dispose();
        } catch (Exception e) {
            System.err.println(e.toString());
        }
    }
}
