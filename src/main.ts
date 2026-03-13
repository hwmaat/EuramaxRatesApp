import { bootstrapApplication } from '@angular/platform-browser';
import 'zone.js';
import { App } from './app/app';
import { licenseKey } from './devextreme-license25.1';
import config from 'devextreme/core/config';
import { inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app/app.routes';
import { globalErrorInterceptor } from '@app/interceptors/global-error.interceptor';
import { authTokenInterceptor } from '@app/interceptors/auth-token.interceptor';
import { Globals } from '@app/services/globals.service';
import { environment } from '@environment/environment';
import { AuthStateService } from '@app/services/auth-state.service';
import DataGrid from 'devextreme/ui/data_grid';
import { ApiService } from '@app/services/api.service';
import { firstValueFrom } from 'rxjs';

//test////
config({ licenseKey });

    DataGrid.defaultOptions({
      options: {
        allowColumnReordering: true,
        allowColumnResizing: true,
        columnResizingMode: 'widget',
        showBorders: false,
        showColumnLines: false,
        rowAlternationEnabled: true,
        columnAutoWidth: true,
        hoverStateEnabled:true,
        focusedRowEnabled:true,
        columnHidingEnabled: true,
        selection: { mode: 'single' },
        paging: { enabled: false, pageSize: 15 },
        pager: {
          visible: false, showNavigationButtons: true,
          showPageSizeSelector: true, allowedPageSizes: [5, 10, 15, 20, 25, 100],
          showInfo: true
        },
        editing: { mode: 'cell', allowUpdating: false, allowDeleting: false, allowAdding: false},
        sorting: { mode: 'multiple' },
        grouping: { contextMenuEnabled: true},
        columnChooser: { enabled: false, mode: 'dragAndDrop' },
        columnFixing: { enabled: true },
        searchPanel: { visible: true },
        groupPanel: { visible: true },
        focusedRowIndex: 0,
        scrolling: {mode: 'standard'},
        export: {enabled: false, allowExportSelectedData:true}
      }
    } );

const versionInitializer = () => {
  const api = inject(ApiService);
  return firstValueFrom(api.checkBackendVersionFromSettings());
};
 
export function configurationInitializer(): () => Promise<void> {
  return async () => {
    const globals = inject(Globals);
    const api = inject(ApiService);
    const authState = inject(AuthStateService);

    const initialMode = environment.production ? 'prod' : 'dev';

    // 1) Config load must succeed; otherwise app shouldn’t start
    await globals.setEnvironmentMode(initialMode);

    // 2) Version check should NEVER reject the initializer Promise.
    //    It handles its own errors internally.
    //await firstValueFrom(api.checkBackendVersionFromSettings());

    await authState.init();
  };
}

  bootstrapApplication(App, {
    providers: [
      provideZoneChangeDetection({ eventCoalescing: true }),
      provideRouter(routes),
      provideAppInitializer(configurationInitializer()),
      provideHttpClient(withInterceptors([authTokenInterceptor, globalErrorInterceptor]))
    ]
  })
  .catch((err) => console.error(err));
