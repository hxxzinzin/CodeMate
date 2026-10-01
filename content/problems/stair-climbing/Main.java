import java.io.*;

public class Main {
    static final long MOD = 1_000_000_007L;

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(br.readLine().trim());
        System.out.println(countWays(n));
    }

    /** ways[i] = ways[i-1] + ways[i-2]. 직전 두 값만 변수로 유지한다. */
    static long countWays(int n) {
        if (n == 1) return 1;
        long prev2 = 1; // ways[1]
        long prev1 = 2; // ways[2]
        for (int i = 3; i <= n; i++) {
            long cur = (prev1 + prev2) % MOD;
            prev2 = prev1;
            prev1 = cur;
        }
        return prev1;
    }
}
