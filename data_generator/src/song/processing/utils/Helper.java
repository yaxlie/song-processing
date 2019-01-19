package song.processing.utils;

import org.vamp_plugins.RealTime;
import java.io.File;
import java.io.FileInputStream;
import java.util.concurrent.TimeUnit;


import org.apache.tika.metadata.Metadata;
import org.apache.tika.parser.ParseContext;
import org.apache.tika.parser.mp3.Mp3Parser;
import org.apache.tika.sax.BodyContentHandler;


public class Helper {
    public static double RealTime2Double(RealTime time){
        return Double.parseDouble(time.toString());
    }

    public static String RealTime2String(RealTime time, int precision){
        return String.format("%." + precision + "f", RealTime2Double(time)).replace(",", ".");
    }


    public static String[] getDurationAndName(File file) throws Exception{

        BodyContentHandler handler = new BodyContentHandler();
        Metadata metadata = new Metadata();
        FileInputStream inputstream = new FileInputStream(file);
        ParseContext pcontext = new ParseContext();

        Mp3Parser  Mp3Parser = new  Mp3Parser();
        Mp3Parser.parse(inputstream, handler, metadata, pcontext);

        String[] data = new String[2];
        data[1]=metadata.get("title");


        long duration=Math.round(Math.round(Float.valueOf(metadata.get("xmpDM:duration")) ));

        data[0]=(String.format("%d min %d sec",
                TimeUnit.MILLISECONDS.toMinutes(duration),
                TimeUnit.MILLISECONDS.toSeconds(duration) - TimeUnit.MINUTES.toSeconds(TimeUnit.MILLISECONDS.toMinutes(duration))));
        return data;
    }
}
