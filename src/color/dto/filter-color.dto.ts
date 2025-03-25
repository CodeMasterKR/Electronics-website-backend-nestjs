export class ColorFilterDto {
  colorName?: string;
  page?: number = 1;
  limit?: number = 10;
  order?: 'asc' | 'desc' = 'asc';
  sortBy?: string;
}