import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { MedicineListComponent } from './components/medicine/medicine-list/medicine-list.component';
import { MedicineSearchComponent } from './components/medicine/medicine-search/medicine-search.component';
import { UserManagementComponent } from './components/users/user-management/user-management.component';
import { AuditHistoryComponent } from './components/history/audit-history/audit-history.component';
import { RecentActivityComponent } from './components/history/recent-activity/recent-activity.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: '', 
    component: DashboardComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'medicines', 
    component: MedicineListComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'search', 
    component: MedicineSearchComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'users', 
    component: UserManagementComponent, 
    canActivate: [AuthGuard, AdminGuard] 
  },
  { 
    path: 'history', 
    component: AuditHistoryComponent, 
    canActivate: [AuthGuard, AdminGuard] 
  },
  {
    path: 'activity',
    component: RecentActivityComponent,
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

