import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(br.readLine().trim());

        Deque<Integer> queue = new ArrayDeque<>();
        for (int i = 1; i <= n; i++) {
            queue.offer(i);
        }

        StringBuilder sb = new StringBuilder();
        while (queue.size() > 1) {
            sb.append(queue.poll()).append(' ');  // 맨 위 카드를 버린다
            queue.offer(queue.poll());            // 다음 카드를 맨 아래로 옮긴다
        }
        sb.append(queue.poll());
        System.out.println(sb);
    }
}
