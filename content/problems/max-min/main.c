#include <stdio.h>

#define MAX_N 100000

int nums[MAX_N];

int main(void) {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    for (int i = 0; i < n; i++) {
        scanf("%d", &nums[i]);
    }

    int max = nums[0];
    int min = nums[0];
    for (int i = 1; i < n; i++) {
        if (nums[i] > max) max = nums[i];
        if (nums[i] < min) min = nums[i];
    }
    printf("%d %d\n", max, min);
    return 0;
}
