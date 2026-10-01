import java.io.*;
import java.util.*;

public class Main {
    static final int[] DR = {-1, 1, 0, 0};
    static final int[] DC = {0, 0, -1, 1};

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer st = new StringTokenizer(br.readLine());
        int n = Integer.parseInt(st.nextToken());
        int m = Integer.parseInt(st.nextToken());

        char[][] grid = new char[n][];
        for (int i = 0; i < n; i++) {
            grid[i] = br.readLine().trim().toCharArray();
        }

        System.out.println(bfs(grid, n, m));
    }

    static int bfs(char[][] grid, int n, int m) {
        int[][] dist = new int[n][m];
        for (int[] row : dist) Arrays.fill(row, -1);

        // 칸 (r, c)를 r * m + c 하나의 정수로 저장하는 배열 큐
        int[] queue = new int[n * m];
        int head = 0, tail = 0;
        dist[0][0] = 0;
        queue[tail++] = 0;

        while (head < tail) {
            int cur = queue[head++];
            int r = cur / m, c = cur % m;
            for (int d = 0; d < 4; d++) {
                int nr = r + DR[d], nc = c + DC[d];
                if (nr < 0 || nr >= n || nc < 0 || nc >= m) continue;
                if (grid[nr][nc] == '#' || dist[nr][nc] != -1) continue;
                dist[nr][nc] = dist[r][c] + 1; // 큐에 넣을 때 방문 표시
                queue[tail++] = nr * m + nc;
            }
        }
        return dist[n - 1][m - 1];
    }
}
