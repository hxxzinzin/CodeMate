#include <stdio.h>
#include <string.h>

#define MAX_LEN 100000

char s[MAX_LEN + 1];

int is_palindrome(const char *str) {
    int left = 0;
    int right = (int)strlen(str) - 1;
    while (left < right) {
        if (str[left] != str[right]) return 0;
        left++;
        right--;
    }
    return 1;
}

int main(void) {
    if (scanf("%100000s", s) != 1) return 0;

    printf("%s\n", is_palindrome(s) ? "YES" : "NO");
    return 0;
}
