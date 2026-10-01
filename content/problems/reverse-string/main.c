#include <stdio.h>
#include <string.h>

#define MAX_LEN 100000

char s[MAX_LEN + 1];

void reverse(char *str) {
    char *left = str;
    char *right = str + strlen(str) - 1;
    while (left < right) {
        char tmp = *left;
        *left = *right;
        *right = tmp;
        left++;
        right--;
    }
}

int main(void) {
    if (scanf("%100000s", s) != 1) return 0;

    reverse(s);
    printf("%s\n", s);
    return 0;
}
