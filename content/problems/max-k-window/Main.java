import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer st = new StringTokenizer(br.readLine());
        int n = Integer.parseInt(st.nextToken());
        int k = Integer.parseInt(st.nextToken());

        int[] profit = new int[n + 1]; // 1일부터 사용
        st = new StringTokenizer(br.readLine());
        for (int i = 1; i <= n; i++) {
            profit[i] = Integer.parseInt(st.nextToken());
        }

        // 첫 K일의 합으로 시작
        long sum = 0;
        for (int i = 1; i <= k; i++) {
            sum += profit[i];
        }
        long best = sum;
        int bestDay = 1;

        // 구간을 한 칸씩 오른쪽으로 민다: i일이 들어오고 i-K일이 빠진다
        for (int i = k + 1; i <= n; i++) {
            sum += profit[i] - profit[i - k];
            if (sum > best) { // 동점이면 먼저 시작한 구간을 유지
                best = sum;
                bestDay = i - k + 1;
            }
        }

        System.out.println(best + " " + bestDay);
    }
}
