import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(br.readLine().trim());

        PriorityQueue<Long> pq = new PriorityQueue<>(); // 기본이 최소 힙
        StringTokenizer st = new StringTokenizer(br.readLine());
        for (int i = 0; i < n; i++) {
            pq.add(Long.parseLong(st.nextToken()));
        }

        long total = 0;
        while (pq.size() > 1) {
            long merged = pq.poll() + pq.poll(); // 가장 작은 두 묶음을 합친다
            total += merged;
            pq.add(merged); // 새로 생긴 묶음도 다시 후보가 된다
        }
        System.out.println(total);
    }
}
