import {
    isPositiveNumeric,
    isWithinNumericRange,
    resolve,
} from '../shared/validationFunctions';
import selectn from 'selectn';

const validateLodging = (values, basePath) => {
    const errors = {};

    let valuePath = `${basePath}.total_population`;
    if (!isPositiveNumeric(valuePath, values, true)) {
        errors['total_population'] =
            'The estimated total population in all on-site lodging.';
    }

    let flushRateErrors = validateFlushRates(
        values,
        basePath,
        'onsite lodging'
    );
    Object.assign(errors, flushRateErrors);

    return Object.keys(errors).length === 0 ? undefined : errors;
};

const validateFacility = (values, basePath) => {
    const errors = {};
    let valuePath = `${basePath}.total_population`;
    if (!isPositiveNumeric(valuePath, values, true)) {
        errors['total_population'] =
            'The estimated overall average daily campus staff population for weekdays, excluding hospital/clinics (calculated above, if applicable).';
    }
    valuePath = `${basePath}.total_population_weekends`;
    if (!isPositiveNumeric(valuePath, values, true)) {
        errors['total_population_weekends'] =
            'The estimated overall average daily campus staff population for weekends, excluding hospital/clinics (calculated above, if applicable).';
    }

    let weekDayPopulation = resolve(`${basePath}.total_population`, values);
    let weekendDayPopulation = resolve(
        `${basePath}.total_population_weekends`,
        values
    );
    if (weekDayPopulation == 0 && weekendDayPopulation == 0) {
        errors['total_population'] =
            'The campus weekday and weekend day population cannot both be zero.';
        errors['total_population_weekends'] =
            'The campus weekday and weekend day population cannot both be zero.';
    }

    if (weekendDayPopulation != 0) {
        valuePath = `${basePath}.shift_weekend`;
        if (!isPositiveNumeric(valuePath, values)) {
            errors['shift_weekend'] =
                'The average length of a weekend day shift.';
        }
        valuePath = `${basePath}.operating_weekend`;
        if (!isWithinNumericRange(valuePath, values, 1, 104, true)) {
            errors['operating_weekend'] =
                'The number of weekend days per year the campus operates must be between 1 and 104.';
        }
    }

    if (weekDayPopulation != 0) {
        valuePath = `${basePath}.shift_weekday`;
        if (!isPositiveNumeric(valuePath, values)) {
            errors['shift_weekday'] = 'The average length of a weekday shift.';
        }
        valuePath = `${basePath}.operating_weeks`;
        if (!isWithinNumericRange(valuePath, values, 0, 260, true)) {
            errors['operating_weeks'] =
                'The number of weekdays per year the campus operates must be between 0 and 260.';
        }
    }

    valuePath = `${basePath}.male_population`;
    if (!isWithinNumericRange(valuePath, values, 0, 100, true)) {
        errors['male_population'] =
            'Percentage of population that is male be between 0 and 100.';
    }
    valuePath = `${basePath}.shower_flow_rate`;
    if (
        resolve(valuePath, values) != 0 &&
        resolve(valuePath, values) != undefined
    ) {
        valuePath = `${basePath}.shower_usage`;
        if (!isWithinNumericRange(valuePath, values, 0, 100, true)) {
            errors['shower_usage'] =
                'Percentage of general campus occupants that use showers on a daily basis must be between 0 and 100.';
        }
    }

    let flushRateErrors = validateFlushRates(
        values,
        basePath,
        'overall campus'
    );
    Object.assign(errors, flushRateErrors);

    return Object.keys(errors).length === 0 ? undefined : errors;
};

const validateHospital = (values, basePath) => {
    const errors = {};
    let valuePath = `${basePath}.days_per_year`;

    if (!isWithinNumericRange(valuePath, values, 1, 365, true)) {
        errors['days_per_year'] =
            'The number of days per year the hospital/clinic is open must be between 1 and 365.';
    }
    valuePath = `${basePath}.daily_staff`;
    if (!isPositiveNumeric(valuePath, values, true)) {
        errors['daily_staff'] =
            'The approximate number of hospital/clinic daily staff.';
    }
    valuePath = `${basePath}.administrative`;
    if (!isPositiveNumeric(valuePath, values, true)) {
        errors['administrative'] =
            'Percentage of hospital clinic staff that are administrative must be between 0 and 100.';
    }
    valuePath = `${basePath}.hospital_male`;
    if (!isPositiveNumeric(valuePath, values, true)) {
        errors['hospital_male'] =
            'Percentage of hospital clinic staff that are male must be between 0 and 100.';
    }
    valuePath = `${basePath}.staff_shift`;
    if (!isPositiveNumeric(valuePath, values)) {
        errors['staff_shift'] =
            'The average length of a hospital/clinic staff shift.';
    }
    valuePath = `${basePath}.outpatient_visits`;
    if (!isPositiveNumeric(valuePath, values, true)) {
        errors['outpatient_visits'] =
            'The average number of outpatient visits in a day.';
    }
    valuePath = `${basePath}.outpatient_duration`;
    if (!isPositiveNumeric(valuePath, values, true)) {
        errors['outpatient_duration'] =
            'The average length of an outpatient visit.';
    }
    valuePath = `${basePath}.inpatient_per_day`;
    if (!isPositiveNumeric(valuePath, values, true)) {
        errors['inpatient_per_day'] =
            'The average number of inpatients in a day. Please put 0 if no overnight patients.';
    }
    valuePath = `${basePath}.shower_flow_rate`;
    if (
        resolve(valuePath, values) != 0 &&
        resolve(valuePath, values) != undefined
    ) {
        valuePath = `${basePath}.shower_usage_staff`;
        if (!isWithinNumericRange(valuePath, values, 0, 100, true)) {
            errors['shower_usage_staff'] =
                'Percentage of hospital staff that use showers on a daily basis must be between 0 and 100.';
        }
        if (selectn(`${basePath}.inpatient_per_day`)(values) != 0) {
            valuePath = `${basePath}.shower_usage_inpatient`;
            if (!isWithinNumericRange(valuePath, values, 0, 100, true)) {
                errors['shower_usage_inpatient'] =
                    'Percentage of hospital inpatients that use showers on a daily basis must be between 0 and 100.';
            }
        }
    }
    let flushRateErrors = validateFlushRates(
        values,
        basePath,
        'hospital/medical clinic'
    );
    Object.assign(errors, flushRateErrors);

    return Object.keys(errors).length === 0 ? undefined : errors;
};

const validateFlushRates = (values, basePath, source) => {
    const errors = {};
    let valuePath = `${basePath}.typical_flush_rate`;
    if (!isWithinNumericRange(valuePath, values, 1.28, 3.5, true)) {
        errors['typical_flush_rate'] =
            'The flush rate of toilets in ' +
            source +
            ' must be between 1.28 and 3.5 gpf.';
    }
    valuePath = `${basePath}.urinals`;
    if (
        resolve(valuePath, values) == 'Yes' &&
        resolve(valuePath, values) != undefined
    ) {
        valuePath = `${basePath}.urinal_flush_rate`;
        if (!isWithinNumericRange(valuePath, values, 0.5, 1.0, true)) {
            errors['urinal_flush_rate'] =
                'The flush rate of urinals in ' +
                source +
                ' must be between 0.5 and 1.0 gpf.';
        }
    }
    valuePath = `${basePath}.aerator_flow_rate`;
    if (!isWithinNumericRange(valuePath, values, 0.5, 2.5, true)) {
        errors['aerator_flow_rate'] =
            'The flow rate of restroom faucet aerators in ' +
            source +
            ' must be between 0.5 and 2.5 gpm.';
    }
    valuePath = `${basePath}.kitchenette_flow_rate`;
    if (!isWithinNumericRange(valuePath, values, 0.5, 2.5, true)) {
        if (resolve(valuePath, values) != 0) {
            errors['kitchenette_flow_rate'] =
                'If present the flow rate of kitchenette faucet aerators in ' +
                source +
                ' must be between 0.5 and 2.5 gpm.';
        }
    }
    valuePath = `${basePath}.shower_flow_rate`;
    if (!isWithinNumericRange(valuePath, values, 1.0, 2.5, true)) {
        if (resolve(valuePath, values) != 0) {
            errors['shower_flow_rate'] =
                'If present the flow rate of showers in ' +
                source +
                ' must be between 1.0 and 2.5 gpm.';
        }
    }

    return Object.keys(errors).length === 0 ? undefined : errors;
};

const validate = values => {
    const errors = {};
    if (!values.plumbing) {
        errors.plumbing = 'An answer about plumbing facilities is required.';
    }

    const plumbing = {};
    const basePath = 'plumbing';
    errors[basePath] = plumbing;

    if (selectn(`${basePath}.has_onsite_lodging`)(values) === true) {
        let sectionErrors = validateLodging(values, `${basePath}.lodging`);
        if (sectionErrors) {
            plumbing['lodging'] = sectionErrors;
        }
    }

    if (selectn(`${basePath}.has_hospital`)(values) === true) {
        let sectionErrors = validateHospital(values, `${basePath}.hospital`);
        if (sectionErrors) {
            plumbing['hospital'] = sectionErrors;
        }
    }

    let sectionErrors = validateFacility(values, `${basePath}.facility`);
    if (sectionErrors) {
        plumbing['facility'] = sectionErrors;
    }

    return errors;
};
export default validate;
