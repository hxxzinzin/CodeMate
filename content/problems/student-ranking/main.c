#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_N 100000

struct Student {
    char name[11]; /* 최대 10글자 + 널 문자 */
    int score;
};

struct Student students[MAX_N];

/* 점수 내림차순, 점수가 같으면 이름 사전순 */
int compare_student(const void *a, const void *b) {
    const struct Student *x = (const struct Student *)a;
    const struct Student *y = (const struct Student *)b;
    if (x->score != y->score) {
        return y->score - x->score;
    }
    return strcmp(x->name, y->name);
}

int main(void) {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    for (int i = 0; i < n; i++) {
        scanf("%10s %d", students[i].name, &students[i].score);
    }

    qsort(students, n, sizeof(struct Student), compare_student);

    for (int i = 0; i < n; i++) {
        printf("%s %d\n", students[i].name, students[i].score);
    }
    return 0;
}
