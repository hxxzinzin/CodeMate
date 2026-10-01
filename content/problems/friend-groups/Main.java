import java.io.*;
import java.util.*;

public class Main {
    static int[] parent;
    static int[] size;
    static int groups;

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer st = new StringTokenizer(br.readLine());
        int n = Integer.parseInt(st.nextToken());
        int q = Integer.parseInt(st.nextToken());

        parent = new int[n + 1];
        size = new int[n + 1];
        for (int i = 1; i <= n; i++) {
            parent[i] = i;
            size[i] = 1;
        }
        groups = n;

        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < q; i++) {
            st = new StringTokenizer(br.readLine());
            int type = Integer.parseInt(st.nextToken());
            int a = Integer.parseInt(st.nextToken());
            int b = Integer.parseInt(st.nextToken());
            if (type == 1) {
                union(a, b);
            } else {
                sb.append(find(a) == find(b) ? "YES" : "NO").append('\n');
            }
        }
        sb.append(groups).append('\n');
        System.out.print(sb);
    }

    /** 루트를 찾고, 지나온 노드들이 루트를 직접 가리키게 한다 (경로 압축). */
    static int find(int x) {
        int root = x;
        while (parent[root] != root) root = parent[root];
        while (x != root) {
            int next = parent[x];
            parent[x] = root;
            x = next;
        }
        return root;
    }

    /** 서로 다른 그룹이면 작은 트리를 큰 트리 밑에 붙이고 그룹 수를 줄인다. */
    static void union(int a, int b) {
        int ra = find(a), rb = find(b);
        if (ra == rb) return;
        if (size[ra] < size[rb]) {
            int t = ra;
            ra = rb;
            rb = t;
        }
        parent[rb] = ra;
        size[ra] += size[rb];
        groups--;
    }
}
