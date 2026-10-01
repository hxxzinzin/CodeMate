#include <stdio.h>

#define MAX_N 100000

int books[MAX_N];

/* target 이상인 값이 처음 나오는 인덱스. 없으면 n */
int lower_bound(const int *arr, int n, int target) {
    int lo = 0;
    int hi = n;
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (arr[mid] < target) {
            lo = mid + 1;
        } else {
            hi = mid;
        }
    }
    return lo;
}

int main(void) {
    int n, m;
    if (scanf("%d", &n) != 1) return 0;
    for (int i = 0; i < n; i++) {
        scanf("%d", &books[i]);
    }

    scanf("%d", &m);
    for (int i = 0; i < m; i++) {
        int target;
        scanf("%d", &target);
        int idx = lower_bound(books, n, target);
        printf("%d\n", (idx < n && books[idx] == target) ? idx + 1 : -1);
    }
    return 0;
}
