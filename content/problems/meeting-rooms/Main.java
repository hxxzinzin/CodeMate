import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(br.readLine().trim());

        int[][] meetings = new int[n][2];
        for (int i = 0; i < n; i++) {
            StringTokenizer st = new StringTokenizer(br.readLine());
            meetings[i][0] = Integer.parseInt(st.nextToken());
            meetings[i][1] = Integer.parseInt(st.nextToken());
        }

        // 끝나는 시각 오름차순 (빼기 대신 Integer.compare로 오버플로 방지)
        Arrays.sort(meetings, (a, b) -> Integer.compare(a[1], b[1]));

        int count = 0;
        int lastEnd = -1;
        for (int[] meeting : meetings) {
            if (meeting[0] >= lastEnd) { // 끝나는 시각과 시작 시각이 같아도 이어서 열 수 있다
                count++;
                lastEnd = meeting[1];
            }
        }
        System.out.println(count);
    }
}
