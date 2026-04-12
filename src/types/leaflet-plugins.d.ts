import * as L from 'leaflet';

declare module 'leaflet' {
  namespace Draw {
    const Event: {
      CREATED: string;
      DELETED: string;
      EDITED: string;
      DRAWSTART: string;
      DRAWSTOP: string;
      DRAWVERTEX: string;
      EDITSTART: string;
      EDITSTOP: string;
      DELETESTART: string;
      DELETESTOP: string;
    };
  }

  namespace Control {
    class Draw extends L.Control {
      constructor(options?: any);
    }
  }

  function markerClusterGroup(options?: any): any;
}
