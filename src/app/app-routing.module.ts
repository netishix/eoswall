import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { WhyComponent } from './components/why/why.component';
import { FaqComponent } from './components/faq/faq.component';



const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'why', component: WhyComponent},
    { path: 'faq', component: FaqComponent},
    { path: '**', component: HomeComponent},
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {}
