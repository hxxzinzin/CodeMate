#include <stdio.h>

#define MAX_N 100
#define MAX_NAME 20

struct Student {
    char name[MAX_NAME + 1];
    int score;
};

int total_score(const struct Student *students, int n) {
    int sum = 0;
    for (int i = 0; i < n; i++) {
        sum += students[i].score;
    }
    return sum;
}

/* 평균 이상인지 정수로 비교한다: score >= sum / n  <=>  score * n >= sum */
int is_above_average(const struct Student *s, int sum, int n) {
    return s->score * n >= sum;
}

int main(void) {
    struct Student students[MAX_N];
    int n;
    if (scanf("%d", &n) != 1) return 0;
    for (int i = 0; i < n; i++) {
        scanf("%20s %d", students[i].name, &students[i].score);
    }

    int sum = total_score(students, n);

    int count = 0;
    for (int i = 0; i < n; i++) {
        if (is_above_average(&students[i], sum, n)) count++;
    }

    printf("%d\n", count);
    for (int i = 0; i < n; i++) {
        if (is_above_average(&students[i], sum, n)) {
            printf("%s\n", students[i].name);
        }
    }
    return 0;
}
