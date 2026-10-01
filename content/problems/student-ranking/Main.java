import java.io.*;
import java.util.*;

public class Main {
    static class Student {
        final String name;
        final int score;

        Student(String name, int score) {
            this.name = name;
            this.score = score;
        }
    }

    /** 점수 내림차순, 점수가 같으면 이름 사전순 */
    static final Comparator<Student> RANKING = (a, b) -> {
        if (a.score != b.score) {
            return Integer.compare(b.score, a.score);
        }
        return a.name.compareTo(b.name);
    };

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(br.readLine().trim());

        List<Student> students = new ArrayList<>(n);
        for (int i = 0; i < n; i++) {
            StringTokenizer st = new StringTokenizer(br.readLine());
            String name = st.nextToken();
            int score = Integer.parseInt(st.nextToken());
            students.add(new Student(name, score));
        }

        students.sort(RANKING);

        StringBuilder sb = new StringBuilder();
        for (Student s : students) {
            sb.append(s.name).append(' ').append(s.score).append('\n');
        }
        System.out.print(sb);
    }
}
