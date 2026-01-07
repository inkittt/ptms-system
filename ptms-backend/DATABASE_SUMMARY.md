# Database Summary

## Current Database State

### ✅ All Data Verified Correct

**Total Students: 30**
**Total Coordinators: 3**

---

## Students by Program

### CS255 - Computer Science (10 students)
| Matric No   | Name                      | Email                              | Credits |
|-------------|---------------------------|------------------------------------|---------|
| 2021234501  | Alice Tan Wei Ling        | 2021234501@student.uitm.edu.my    | 120     |
| 2021234502  | Benjamin Lim Khai Ming    | 2021234502@student.uitm.edu.my    | 115     |
| 2021234503  | Catherine Wong Mei Yee    | 2021234503@student.uitm.edu.my    | 118     |
| 2021234504  | Daniel Ng Zhi Hao         | 2021234504@student.uitm.edu.my    | 113     |
| 2021234505  | Emma Lee Xin Yi           | 2021234505@student.uitm.edu.my    | 125     |
| 2021234506  | Fariz Ahmad Bin Hassan    | 2021234506@student.uitm.edu.my    | 110     |
| 2021234507  | Grace Koh Li Ting         | 2021234507@student.uitm.edu.my    | 122     |
| 2021234508  | Henry Tan Jun Wei         | 2021234508@student.uitm.edu.my    | 108     |
| 2021234509  | Isabella Chong Hui Min    | 2021234509@student.uitm.edu.my    | 116     |
| 2021234510  | Jason Yap Wei Jie         | 2021234510@student.uitm.edu.my    | 119     |

### SE243 - Software Engineering (10 students)
| Matric No   | Name                      | Email                              | Credits |
|-------------|---------------------------|------------------------------------|---------|
| 2021567801  | Karen Liew Shu Ting       | 2021567801@student.uitm.edu.my    | 117     |
| 2021567802  | Liam Ong Wei Lun          | 2021567802@student.uitm.edu.my    | 114     |
| 2021567803  | Michelle Teo Hui Xin      | 2021567803@student.uitm.edu.my    | 121     |
| 2021567804  | Nathan Goh Jun Hao        | 2021567804@student.uitm.edu.my    | 112     |
| 2021567805  | Olivia Sim Yi Ling        | 2021567805@student.uitm.edu.my    | 124     |
| 2021567806  | Peter Khoo Zhi Yang       | 2021567806@student.uitm.edu.my    | 109     |
| 2021567807  | Quinn Tan Hui Ying        | 2021567807@student.uitm.edu.my    | 123     |
| 2021567808  | Ryan Lim Wei Kang         | 2021567808@student.uitm.edu.my    | 111     |
| 2021567809  | Sophia Ng Jia Wen         | 2021567809@student.uitm.edu.my    | 118     |
| 2021567810  | Thomas Chua Jun Ming      | 2021567810@student.uitm.edu.my    | 120     |

### IT226 - Information Technology (10 students)
| Matric No   | Name                      | Email                              | Credits |
|-------------|---------------------------|------------------------------------|---------|
| 2021890101  | Uma Devi Binti Raj        | 2021890101@student.uitm.edu.my    | 115     |
| 2021890102  | Victor Wong Kai Xiang     | 2021890102@student.uitm.edu.my    | 119     |
| 2021890103  | Wendy Lim Hui Qi          | 2021890103@student.uitm.edu.my    | 113     |
| 2021890104  | Xavier Tan Wei Jian       | 2021890104@student.uitm.edu.my    | 126     |
| 2021890105  | Yasmin Binti Abdullah     | 2021890105@student.uitm.edu.my    | 110     |
| 2021890106  | Zachary Ng Jun Kai        | 2021890106@student.uitm.edu.my    | 122     |
| 2021890107  | Amelia Koh Xin Hui        | 2021890107@student.uitm.edu.my    | 107     |
| 2021890108  | Brandon Lee Wei Hao       | 2021890108@student.uitm.edu.my    | 117     |
| 2021890109  | Chloe Tan Li Xuan         | 2021890109@student.uitm.edu.my    | 121     |
| 2021890110  | David Ong Jun Heng        | 2021890110@student.uitm.edu.my    | 114     |

---

## Coordinators

| Name                 | Email                            | Program                  |
|----------------------|----------------------------------|--------------------------|
| Dr. Sarah Johnson    | sarah.johnson@university.edu     | Computer Science         |
| Prof. Ahmad Rahman   | ahmad.rahman@university.edu      | Software Engineering     |
| Dr. Emily Chen       | emily.chen@university.edu        | Information Technology   |

---

## Data Format Verification

✅ **Matric Numbers**: All 10 digits (e.g., 2021234501)  
✅ **Email Format**: All follow `matricNo@student.uitm.edu.my`  
✅ **Program Codes**: All use short codes (CS255, SE243, IT226)  
✅ **Credits Earned**: All students have credits (range: 107-126)  

---

## How to Re-seed

If you need to clean and re-seed the database:

```bash
cd ptms-backend
npx ts-node clean-and-seed.ts
```

This will:
1. Delete all existing student records
2. Keep coordinator records
3. Create fresh student data with correct format

---

## Login Credentials

**Password for all users**: `password123`

**Example Student Logins**:
- `2021234501@student.uitm.edu.my` (Alice, CS255, 120 credits)
- `2021567801@student.uitm.edu.my` (Karen, SE243, 117 credits)
- `2021890101@student.uitm.edu.my` (Uma, IT226, 115 credits)

**Coordinator Logins**:
- `sarah.johnson@university.edu`
- `ahmad.rahman@university.edu`
- `emily.chen@university.edu`
