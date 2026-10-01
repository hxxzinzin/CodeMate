import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer st = new StringTokenizer(br.readLine());
        int n = Integer.parseInt(st.nextToken());
        int m = Integer.parseInt(st.nextToken());

        List<List<Integer>> adj = new ArrayList<>(n + 1);
        for (int i = 0; i <= n; i++) adj.add(new ArrayList<>());
        int[] indegree = new int[n + 1];
        for (int i = 0; i < m; i++) {
            st = new StringTokenizer(br.readLine());
            int a = Integer.parseInt(st.nextToken());
            int b = Integer.parseInt(st.nextToken());
            adj.get(a).add(b); // a를 끝내야 b를 시작할 수 있다
            indegree[b]++;
        }

        // 시작할 수 있는 작업 중 번호가 가장 작은 것을 꺼내기 위해 최소 힙을 쓴다
        PriorityQueue<Integer> ready = new PriorityQueue<>();
        for (int i = 1; i <= n; i++) {
            if (indegree[i] == 0) ready.add(i);
        }

        StringBuilder sb = new StringBuilder();
        int processed = 0;
        while (!ready.isEmpty()) {
            int u = ready.poll();
            if (processed > 0) sb.append(' ');
            sb.append(u);
            processed++;
            for (int v : adj.get(u)) {
                if (--indegree[v] == 0) ready.add(v);
            }
        }

        // 처리하지 못한 작업이 남았다면 순환이 있다
        System.out.println(processed == n ? sb.toString() : "-1");
    }
}
