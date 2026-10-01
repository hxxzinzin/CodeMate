#include <stdio.h>
#include <stdlib.h>

#define MAX_N 100000

int prices[MAX_N];

/* qsort 비교 함수: void 포인터를 int 포인터로 바꿔 값을 비교한다 */
int compare_int(const void *a, const void *b) {
    int x = *(const int *)a;
    int y = *(const int *)b;
    return (x > y) - (x < y);
}

int main(void) {
    int n, k;
    if (scanf("%d %d", &n, &k) != 2) return 0;
    for (int i = 0; i < n; i++) {
        scanf("%d", &prices[i]);
    }

    qsort(prices, n, sizeof(int), compare_int);

    int *left = prices;
    int *right = prices + n - 1;
    int count = 0;
    while (left < right) {
        int sum = *left + *right;
        if (sum == k) {
            count++;
            left++;
            right--;
        } else if (sum < k) {
            left++;
        } else {
            right--;
        }
    }

    printf("%d\n", count);
    return 0;
}
