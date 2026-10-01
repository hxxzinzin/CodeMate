#include <stdio.h>

#define MAX_LEN 100000

char n[MAX_LEN + 1];

int main(void) {
    if (scanf("%100000s", n) != 1) return 0;

    int sum = 0;
    for (int i = 0; n[i] != '\0'; i++) {
        sum += n[i] - '0';
    }
    printf("%d\n", sum);
    return 0;
}
