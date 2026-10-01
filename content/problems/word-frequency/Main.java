import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(br.readLine().trim());
        StringTokenizer st = new StringTokenizer(br.readLine());

        Map<String, Integer> counts = new HashMap<>();
        for (int i = 0; i < n; i++) {
            counts.merge(st.nextToken(), 1, Integer::sum);
        }

        String bestWord = null;
        int bestCount = 0;
        for (Map.Entry<String, Integer> entry : counts.entrySet()) {
            String word = entry.getKey();
            int count = entry.getValue();
            if (count > bestCount || (count == bestCount && word.compareTo(bestWord) < 0)) {
                bestWord = word;
                bestCount = count;
            }
        }
        System.out.println(bestWord + " " + bestCount);
    }
}
