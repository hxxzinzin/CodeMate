import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer st = new StringTokenizer(br.readLine());
        int n = Integer.parseInt(st.nextToken());
        int k = Integer.parseInt(st.nextToken());

        int[] coins = new int[n];
        st = new StringTokenizer(br.readLine());
        for (int i = 0; i < n; i++) {
            coins[i] = Integer.parseInt(st.nextToken());
        }

        System.out.println(minCoins(coins, k));
    }

    static int minCoins(int[] coins, int k) {
        final int INF = k + 1; // 동전 개수는 K를 넘을 수 없으므로 K + 1을 "만들 수 없음"으로 쓴다
        int[] dp = new int[k + 1];
        Arrays.fill(dp, INF);
        dp[0] = 0;

        for (int x = 1; x <= k; x++) {
            for (int c : coins) {
                if (c <= x && dp[x - c] + 1 < dp[x]) {
                    dp[x] = dp[x - c] + 1;
                }
            }
        }
        return dp[k] == INF ? -1 : dp[k];
    }
}
