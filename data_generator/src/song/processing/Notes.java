package song.processing;

import java.util.HashMap;
import java.util.Map;

public final class Notes {

    private static final Map<Integer, String> notesDict;

    static {
        notesDict = new HashMap<Integer, String>() {
            {
                put(12, "C");
                put(13, "C#");
                put(14, "D");
                put(15, "D#");
                put(16, "E");
                put(17, "F");
                put(18, "F#");
                put(19, "G");
                put(20, "G#");
                put(21, "A");
                put(22, "A#");
                put(23, "H");
            }
        };
    }

    /**
     * Zwraca nutę w zapisie literowym (zamiana z wartości midi)
     */
    public static String note(int value)
    {
        int octave = 0;
        // klawiatura fortepianu ma zakres <21;108> w midi. Zaczynam od 12 dla ułatwienia.
        if (value >= 12 && value < 109)
        {
            while (!notesDict.containsKey(value)){
                octave++;
                value -= 12; // Oktawa ma 12 półtonów
            }
            return notesDict.get(value) + octave;
        }

        return "¯\\_(ツ)_/¯";
    }

}
