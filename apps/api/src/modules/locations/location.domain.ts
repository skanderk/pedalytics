/**
 * Model for an existing location.
 *  
 */
export class Location {
  constructor(
    readonly id: number,
    readonly name: string,
    readonly address: string | null,
    readonly city: string,
    readonly provinceState: string | null,
    readonly country: string,
    readonly zipCode: string | null,
    readonly latitude: number | null,
    readonly longitude: number | null
  ) {}
}

/**
 * Model for the details of a location that can be created or updated.
 */
export interface LocationDetails {
  name: string;
  address?: string | null;
  city: string;
  provinceState?: string | null;
  country: string;
  zipCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

