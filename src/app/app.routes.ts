import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { PatientComponent } from './patient/patient.component';
import { RegisterComponent } from './register/register.component';
import { AdminComponent } from './admin/admin.component';
import { OrganizerComponent } from './organizer/organizer.component';
import { VisitDoctorComponent } from './visit-doctor/visit-doctor.component';
import { LabComponent } from './lab/lab.component';
import { HospitalComponent } from './hospital/hospital.component';

export const routes: Routes = [
    {
        path:'',
        redirectTo:'user',
        pathMatch:"full"
    },
    {
        path:"login",
        component:LoginComponent,
    },
    {
        path:"user",
        component:PatientComponent,
    },
    {
        path:'register',
        component:RegisterComponent
    },
    {
        path:'admin',
        component:AdminComponent
    },
    {
        path:'organizer',
        component:OrganizerComponent
    },
    {
        path:'visit-doctor',
        component:VisitDoctorComponent
    },
    {
        path:'lab',
        component:LabComponent
    },
    {
        path:'hospital',
        component:HospitalComponent
    }
];
