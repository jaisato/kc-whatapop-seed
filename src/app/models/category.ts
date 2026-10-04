export class Category {
    
    constructor(
        public id: number,
        public name: string) { }
    
    static fromJson(json: any): Category {
        return new Category(
            +json.id,
            json.name
        );
    }

    static fromJsonToList(json: any[]): Category[] {
        return json.reduce((categories: Category[], category: any) => {
            categories.push(Category.fromJson(category));
            return categories;
        }, []);
    }
}
