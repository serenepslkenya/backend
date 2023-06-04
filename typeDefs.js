const typeDefs = `
type Course {
    id: ID!
    name: String
    createdAt: String
    description: String
    addedBy: User    
    image: String
    was: Int
    category: String
    price: Int
    onSale: Boolean
    lectures: [Lecture]
}

type Lecture{
    id: ID!
    title: String
    content: String  
    description: String
    quiz: [Question]  
    removed: Boolean
}

type Question {
    question: String
    options: [String]
    answer: Int
}

type Trainee {
    id : ID!
    email: String
    fullName: String
    image: String
    password: String
    registeredCourses: [RegisteredCourse]
}

type RegisteredCourse {
    id: ID
    course: Course
    completed: Boolean
    progress: Int
}


type Product {
    id: ID!
    category: String
    subCategory: String
    name: String
    image: String
    specSheet: String    
    description: String
    removed: Boolean
    featured: Boolean
}

type User{
    id: ID!
    image: String   
    firstName: String
    lastName: String
    email: String
    phoneNumber: String
    password: String
    canModifyUsers: Boolean
    canModifyContent: Boolean
    canModifySections: Boolean
    canModifyProducts: Boolean
}

type Section {
    id: ID!
    page: String
    value: String
    identifier: String
}

type Query { 
   getSections (page: String) : [Section] 
   getProducts: [Product]
   getProduct(id:ID!) : Product
   getFeatured: [Product]
   getUsers: [User]
   getUser(email: String, password: String , id: ID) : User
   getCourses: [Course]
   getTrainee(id: ID): Trainee
   getTrainees: [Trainee]
}

type Mutation {
    addLecture(   
        description: String
        content: String
        title: String
        quiz: String
        course: ID
    ): Lecture

    updateTrainee(
        id: ID!
        course: ID
        progress: Int
        completed: Boolean
        password: String
    ): Trainee

   updateLecture(
        id: ID
        title:String
        quiz: String
        content: String
        description: String
        removed: Boolean
      ): Lecture

    addCourse(
        name: String
        addedBy: ID
        price: Int
        description: String
        image: String
        category: String
        onSale: Boolean
        was: Int
    ): Course

    addTrainee(
        email: String
        fullName: String
        password: String
    ): Trainee

    enrollCourse(
        trainee: ID
        course: ID        
    ): Trainee

    addUser(    
        firstName: String   
        lastName: String
        email: String     
        userLevelAccess: String
    ): User

    updateUser(
       email: String
        firstName: String   
        lastName: String
        phoneNumber: String     
        password: String
    ): User

   addSection(
        page: ID
        value: String
        identifier: String        
    ) : Section

    addProduct(
        category: String
        subCategory: String
        name: String
        image: String
        specSheet: String
        description: String
        featured: Boolean
    ) : Product

    updateSection(
        identifier: String
        value: String
    ) : Section

    updateProduct(
        id: ID!
        removed: Boolean
        name: String
        category: String
        subCategory: String
        description: String
    ): Product
}

`;

export default typeDefs;
