#include <stdio.h>

#define MAX_N 100000

int scores[MAX_N];

int main(void) {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    for (int i = 0; i < n; i++) {
        scanf("%d", &scores[i]);
    }

    int first = -1;
    int second = -1;
    for (int i = 0; i < n; i++) {
        int x = scores[i];
        if (x > first) {
            second = first;
            first = x;
        } else if (x < first && x > second) {
            second = x;
        }
    }
    printf("%d\n", second);
    return 0;
}
