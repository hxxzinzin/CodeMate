import java.io.*;
import java.util.*;

public class Main {
    static final int[] DR = {-1, 1, 0, 0};
    static final int[] DC = {0, 0, -1, 1};

    static int n, m;
    static char[][] map;

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer st = new StringTokenizer(br.readLine());
        n = Integer.parseInt(st.nextToken());
        m = Integer.parseInt(st.nextToken());

        map = new char[n][];
        for (int i = 0; i < n; i++) {
            map[i] = br.readLine().trim().toCharArray();
        }

        int count = 0;
        for (int r = 0; r < n; r++) {
            for (int c = 0; c < m; c++) {
                if (map[r][c] == '1') {
                    count++;
                    dfs(r, c);
                }
            }
        }
        System.out.println(count);
    }

    /** (r, c)와 이어진 땅을 모두 '0'으로 바꿔 방문 표시한다. */
    static void dfs(int r, int c) {
        map[r][c] = '0';
        for (int d = 0; d < 4; d++) {
            int nr = r + DR[d], nc = c + DC[d];
            if (nr < 0 || nr >= n || nc < 0 || nc >= m) continue;
            if (map[nr][nc] == '1') dfs(nr, nc);
        }
    }
}
