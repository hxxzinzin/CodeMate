import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(br.readLine().trim());
        StringTokenizer st = new StringTokenizer(br.readLine());

        int first = Integer.parseInt(st.nextToken());
        int max = first;
        int min = first;
        for (int i = 1; i < n; i++) {
            int x = Integer.parseInt(st.nextToken());
            if (x > max) max = x;
            if (x < min) min = x;
        }
        System.out.println(max + " " + min);
    }
}
