import { Skeleton, Stack } from '@mantine/core';

export default function TodosLoading() {
  return (
    <Stack>
      <Skeleton height={36} width={120} ml="auto" />
      <Skeleton height={200} />
    </Stack>
  );
}
