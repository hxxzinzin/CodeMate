#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int n, k;
    if (scanf("%d %d", &n, &k) != 2) return 0;

    int *arr = (int *)malloc(sizeof(int) * n);
    for (int i = 0; i < n; i++) {
        scanf("%d", &arr[i]);
    }

    int *dq = (int *)malloc(sizeof(int) * n);
    int head = 0, tail = 0;

    for (int i = 0; i < n; i++) {
        if (head < tail && dq[head] < i - k + 1) {
            head++;
        }

        while (head < tail && arr[dq[tail - 1]] <= arr[i]) {
            tail--;
        }

        dq[tail++] = i;

        if (i >= k - 1) {
            printf("%d%s", arr[dq[head]], (i == n - 1) ? "" : " ");
        }
    }
    printf("\n");

    free(arr);
    free(dq);
    return 0;
}
