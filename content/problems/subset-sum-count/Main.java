import java.io.*;
import java.util.*;

public class Main {
    static int n;
    static int target;
    static int[] values;
    static int count = 0;

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer st = new StringTokenizer(br.readLine());
        n = Integer.parseInt(st.nextToken());
        target = Integer.parseInt(st.nextToken());

        values = new int[n];
        st = new StringTokenizer(br.readLine());
        for (int i = 0; i < n; i++) {
            values[i] = Integer.parseInt(st.nextToken());
        }

        dfs(0, 0);
        if (target == 0) {
            count--; // 아무것도 고르지 않은 경우(공집합)는 제외
        }
        System.out.println(count);
    }

    /** index번째 원소부터 고를지 말지 결정한다. sum은 지금까지 고른 원소의 합 */
    static void dfs(int index, int sum) {
        if (index == n) {
            if (sum == target) count++;
            return;
        }
        dfs(index + 1, sum + values[index]); // 고른다
        dfs(index + 1, sum);                 // 고르지 않는다
    }
}
