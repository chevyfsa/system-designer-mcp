🎨 UML Diagram Generated (MERMAID):

Model: Student Management System
Format: mermaid

Copy the markup below into your preferred UML tool:

---
classDiagram
title Student Management System
class Student {
    -id: string
    +name: string
    +email: string
    +enroll(course: Course): void
}
class Course {
    -id: string
    +title: string
    +credits: number
    +addStudent(student: Student): void
}
Student --> Course : enrolls in

---