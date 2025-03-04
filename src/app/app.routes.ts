import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { PatientComponent } from './components/patient/patient.component';
import { RegisterComponent } from './components/register/register.component';
import { AdminComponent } from './components/admin/admin.component';
import { OrganizerComponent } from './components/organizer/organizer.component';
import { VisitDoctorComponent } from './components/visit-doctor/visit-doctor.component';
import { LabComponent } from './components/lab/lab.component';
import { HospitalComponent } from './components/hospital/hospital.component';


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
