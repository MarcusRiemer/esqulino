import { Routes, RouterModule } from '@angular/router'

import { AboutComponent } from './about.component'
import { AboutAcademiaComponent } from './academia.component'
import { CreateProjectComponent } from './create-project.component'
import { FrontComponent, indexItems } from './front.component'
import { ImprintComponent } from './imprint.component'
import { ProjectListComponent } from './project-list.component'
import { PrivacyComponent } from './privacy.component'
import { AboutPupilComponent } from './pupil.component'
import { AboutTeacherComponent } from './teacher.component'
import { VideoDisplayComponent } from './video-display.component'
import { VersionComponent } from './version.component';
import { NavSiteComponent } from '../shared/nav-page.component';
import { SelectLanguagePageComponent } from '../shared/select-language-page.component';

export const frontRoutes: Routes = [
  {
    path: '',
    component: FrontComponent,
    children: [
      { path: 'academia', component: AboutAcademiaComponent },
      { path: 'create', component: CreateProjectComponent },
      { path: 'projects', component: ProjectListComponent },
      { path: 'imprint', component: ImprintComponent },
      { path: 'pupil', component: AboutPupilComponent },
      { path: 'privacy', component: PrivacyComponent },
      { path: 'teacher', component: AboutTeacherComponent },
      { path: 'videos', component: VideoDisplayComponent },
      { path: 'version', component: VersionComponent },
      { path: 'nav', component: NavSiteComponent, data: {items: indexItems} },
      { path: 'language', component: SelectLanguagePageComponent},
      { path: '', component: AboutComponent },
    ]
  }
]

export const frontRouting = RouterModule.forChild(frontRoutes);
