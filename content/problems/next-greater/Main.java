import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(br.readLine().trim());
        int[] heights = new int[n];
        StringTokenizer st = new StringTokenizer(br.readLine());
        for (int i = 0; i < n; i++) {
            heights[i] = Integer.parseInt(st.nextToken());
        }

        int[] answer = nextGreater(heights);

        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            if (i > 0) sb.append(' ');
            sb.append(answer[i]);
        }
        System.out.println(sb);
    }

    static int[] nextGreater(int[] heights) {
        int n = heights.length;
        int[] answer = new int[n];
        Arrays.fill(answer, -1);

        // 아직 답을 찾지 못한 건물의 인덱스를 담는 스택 (배열로 구현)
        int[] stack = new int[n];
        int top = 0;
        for (int i = 0; i < n; i++) {
            while (top > 0 && heights[stack[top - 1]] < heights[i]) {
                answer[stack[--top]] = heights[i];
            }
            stack[top++] = i;
        }
        return answer;
    }
}
