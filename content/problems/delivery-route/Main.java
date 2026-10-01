import java.io.*;
import java.util.*;

public class Main {
    /** u에서 나가는 일방통행 도로 하나 */
    record Edge(int to, int weight) {}

    /** 우선순위 큐에 넣는 (정점, 그 시점의 거리) */
    record Node(int vertex, long dist) {}

    static final long INF = Long.MAX_VALUE / 4;

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer st = new StringTokenizer(br.readLine());
        int n = Integer.parseInt(st.nextToken());
        int m = Integer.parseInt(st.nextToken());
        int start = Integer.parseInt(st.nextToken());

        List<List<Edge>> graph = new ArrayList<>(n + 1);
        for (int i = 0; i <= n; i++) graph.add(new ArrayList<>());
        for (int i = 0; i < m; i++) {
            st = new StringTokenizer(br.readLine());
            int u = Integer.parseInt(st.nextToken());
            int v = Integer.parseInt(st.nextToken());
            int w = Integer.parseInt(st.nextToken());
            graph.get(u).add(new Edge(v, w)); // 방향 그래프: u -> v만 추가
        }

        long[] dist = dijkstra(graph, n, start);

        StringBuilder sb = new StringBuilder();
        for (int i = 1; i <= n; i++) {
            sb.append(dist[i] == INF ? -1 : dist[i]).append('\n');
        }
        System.out.print(sb);
    }

    static long[] dijkstra(List<List<Edge>> graph, int n, int start) {
        long[] dist = new long[n + 1];
        Arrays.fill(dist, INF);
        dist[start] = 0;

        PriorityQueue<Node> pq = new PriorityQueue<>(Comparator.comparingLong(Node::dist));
        pq.add(new Node(start, 0));

        while (!pq.isEmpty()) {
            Node cur = pq.poll();
            int u = cur.vertex();
            if (cur.dist() > dist[u]) continue; // 이미 더 짧은 거리로 처리된 오래된 정보

            for (Edge e : graph.get(u)) {
                long nd = dist[u] + e.weight();
                if (nd < dist[e.to()]) {
                    dist[e.to()] = nd;
                    pq.add(new Node(e.to(), nd));
                }
            }
        }
        return dist;
    }
}
