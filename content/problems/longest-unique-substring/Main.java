import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String s = br.readLine().trim();

        Map<Character, Integer> lastIndex = new HashMap<>();
        int left = 0;
        int bestLen = 0;
        int bestStart = 0;

        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            int prev = lastIndex.getOrDefault(c, -1);
            if (prev >= left) {
                // c가 현재 구간 안에 이미 있으므로 그 다음 칸부터 다시 시작
                left = prev + 1;
            }
            lastIndex.put(c, right);

            int len = right - left + 1;
            if (len > bestLen) { // 동점이면 앞의 것을 유지
                bestLen = len;
                bestStart = left;
            }
        }

        StringBuilder sb = new StringBuilder();
        sb.append(bestLen).append('\n');
        sb.append(s, bestStart, bestStart + bestLen).append('\n');
        System.out.print(sb);
    }
}
