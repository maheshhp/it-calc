import React, { useState } from 'react';
import { defaultTaxInput, defaultSummary } from './constants';

const getGrossTotalIncome = (inputValues) => {
  return Number(inputValues['income_from_sal']) -
    Number(inputValues['sal_std_dedn']) +
    Number(inputValues['income_from_fd']) +
    Number(inputValues['income_from_sb']) +
    Number(inputValues['income_from_mis']) +
    Number(inputValues['income_from_scss']) +
    Number(inputValues['income_from_oth_misc']);
};

const getTotalOtherIncome = (inputValues) => {
  return Number(inputValues['income_from_fd']) +
    Number(inputValues['income_from_sb']) +
    Number(inputValues['income_from_mis']) +
    Number(inputValues['income_from_scss']) +
    Number(inputValues['income_from_oth_misc']);
};

const getTotal80cDeduction = (inputValues) => {
  return Number(inputValues['80c_insurance']) +
    Number(inputValues['80c_fd']) +
    Number(inputValues['80c_others']);
};

const getTotal80dAnd80ttaDeduction = (inputValues) => {
  return Number(inputValues['80d_deduction']) +
    Number(inputValues['80tta_deduction']);
};

const handleInputChange = (event, inputValues, setInputValues) => {
  const updatedInputValues = {
    ...inputValues,
    [event.target.id]: event.target.value,
  };
  setInputValues({
    ...updatedInputValues,
    gross_total_income: getGrossTotalIncome(updatedInputValues),
    total_other_income: getTotalOtherIncome(updatedInputValues),
    total_80c_deduction: getTotal80cDeduction(updatedInputValues),
    total_80d_80tta_deduction: getTotal80dAnd80ttaDeduction(updatedInputValues)
  })
};

const computeAndSetSummary = (inputValues, setSummary) => {
  const total80dAnd80ttaDeduction =
    (Number(inputValues['80d_deduction']) > 15000 ? 15000 : Number(inputValues['80d_deduction'])) +
    (Number(inputValues['80tta_deduction']) > 10000 ? 10000 :
      Number(inputValues['80tta_deduction']));
  const total80cDeduction = Number(inputValues['total_80c_deduction']) > 150000 ? 150000 :
    Number(inputValues['total_80c_deduction']);
  const totalDeductions = total80dAnd80ttaDeduction + total80cDeduction;
  const totalTaxableIncome = Number(inputValues['gross_total_income']) - totalDeductions;
  let taxSlabOne = 0, taxSlabTwo = 0, taxSlabThree = 0;
  if (totalTaxableIncome > 1000000) {
    taxSlabThree = 0.3 * (totalTaxableIncome - 1000000);
  }
  if (totalTaxableIncome > 500000) {
    taxSlabTwo = 0.2 * (totalTaxableIncome >= 1000000 ? 500000 : (totalTaxableIncome - 500000));
  }
  if (totalTaxableIncome > 250000) {
    taxSlabOne = 0.05 * (totalTaxableIncome >= 500000 ? 250000 : (totalTaxableIncome - 250000));
  }
  const totalCalcTax = taxSlabOne + taxSlabTwo + taxSlabThree;
  const healthAndEduCess = 0.04 * totalCalcTax;
  const totalTax = totalCalcTax + healthAndEduCess;
  const totalTaxPayable = totalTax > Number(inputValues['tds']) ?
    (totalTax - Number(inputValues['tds'])) : 0;
  const totalRefund = totalTax < Number(inputValues['tds']) ?
    (Number(inputValues['tds']) - totalTax) : 0;

  setSummary({
    totalTaxableIncome,
    totalDeductions,
    taxSlabOne: taxSlabOne.toFixed(2),
    taxSlabTwo: taxSlabTwo.toFixed(2),
    taxSlabThree: taxSlabThree.toFixed(2),
    totalTax: totalTax.toFixed(2),
    healthAndEduCess: healthAndEduCess.toFixed(2),
    totalTaxPayable: totalTaxPayable.toFixed(2),
    totalRefund: totalRefund.toFixed(2)
  })
};

const App = () => {
  const [inputValues, setInputValues] = useState(defaultTaxInput);
  const [summary, setSummary] = useState(defaultSummary);
  return (
    <div>
      <div className="navbar-fixed">
        <nav>
          <div className="nav-wrapper theme-color-blue-bg">
            <div className="brand-logo l-1">IT Calc</div>
          </div>
        </nav>
      </div>
      <div className="row">
        <div className="col l8 m8 s12">
          <h5>Data entry/calculation</h5>
          <div className="row">
            <form className="col s12">

              <div className="row p-1 border-2 m-0">
                <h6>Income from salary</h6>
                <div className="input-field col s6">
                  <input id="income_from_sal" type="number" value={inputValues['income_from_sal']} onChange={(event) => handleInputChange(event, inputValues, setInputValues)} />
                  <label htmlFor="income_from_sal">Income from salary</label>
                </div>
                <div className="input-field col s6">
                  <input id="sal_std_dedn" type="number" value={inputValues['sal_std_dedn']} onChange={(event) => handleInputChange(event, inputValues, setInputValues)} />
                  <label htmlFor="sal_std_dedn">Standard deduction</label>
                </div>
                <div className="input-field col s12">
                  <h6>Income after std. deduction: <span className="theme-color-blue"> {inputValues['income_from_sal'] - inputValues['sal_std_dedn']} </span></h6>
                  <span className="helper-text">(Income from salary - std. deduction)</span>
                </div>
              </div>

              <div className="row p-1 border-2 m-0">
                <h6>Income from other sources</h6>
                <div className="input-field col s4">
                  <input id="income_from_fd" type="number" value={inputValues['income_from_fd']} onChange={(event) => handleInputChange(event, inputValues, setInputValues)} />
                  <label htmlFor="income_from_fd">FD Interest</label>
                </div>
                <div className="input-field col s4">
                  <input id="income_from_sb" type="number" value={inputValues['income_from_sb']} onChange={(event) => handleInputChange(event, inputValues, setInputValues)} />
                  <label htmlFor="income_from_sb">SB Interest</label>
                </div>
                <div className="input-field col s4">
                  <input id="income_from_mis" type="number" value={inputValues['income_from_mis']} onChange={(event) => handleInputChange(event, inputValues, setInputValues)} />
                  <label htmlFor="income_from_mis">MIS</label>
                </div>
                <div className="input-field col s4">
                  <input id="income_from_scss" type="number" value={inputValues['income_from_scss']} onChange={(event) => handleInputChange(event, inputValues, setInputValues)} />
                  <label htmlFor="income_from_scss">SCSS</label>
                </div>
                <div className="input-field col s4">
                  <input id="income_from_oth_misc" type="number" value={inputValues['income_from_oth_misc']} onChange={(event) => handleInputChange(event, inputValues, setInputValues)} />
                  <label htmlFor="income_from_oth_misc">Others</label>
                </div>
                <div className="input-field col s12">
                  <h6>Total: <span className="theme-color-blue"> {inputValues['total_other_income']} </span></h6>
                  <span className="helper-text">(FD Interest + SB Interest + MIS + SCSS + Others)</span>
                </div>
              </div>

              <div className="row p-1 border-2 m-0">
                <h5>Gross Total Income: <span className="theme-color-blue"> {inputValues['gross_total_income']} </span></h5>
              </div>

              <div className="row p-1 border-2 m-0">
                <h6>Deductions under 80C</h6>
                <div className="input-field col s4">
                  <input id="80c_insurance" type="number" value={inputValues['80c_insurance']} onChange={(event) => handleInputChange(event, inputValues, setInputValues)} />
                  <label htmlFor="80c_insurance">Life Insurance / LIC</label>
                </div>
                <div className="input-field col s4">
                  <input id="80c_fd" type="number" value={inputValues['80c_fd']} onChange={(event) => handleInputChange(event, inputValues, setInputValues)} />
                  <label htmlFor="80c_fd">FD &gt; 5 years/ Tax saver FD</label>
                </div>
                <div className="input-field col s4">
                  <input id="80c_others" type="number" value={inputValues['80c_others']} onChange={(event) => handleInputChange(event, inputValues, setInputValues)} />
                  <label htmlFor="80c_others">Others</label>
                </div>
                <div className="input-field col s12">
                  <h6>Total: <span className="theme-color-blue"> {inputValues['total_80c_deduction']} </span></h6>
                  <span className="helper-text">(Note: Max deduction for 80C is 1,50,000)</span>
                </div>
              </div>

              <div className="row p-1 border-2 m-0">
                <h6>Deductions under 80D and 80TTA</h6>
                <div className="input-field col s6">
                  <input id="80d_deduction" type="number" value={inputValues['80d_deduction']} onChange={(event) => handleInputChange(event, inputValues, setInputValues)} />
                  <label htmlFor="80d_deduction">Deduction under 80D</label>
                </div>
                <div className="input-field col s6">
                  <input id="80tta_deduction" type="number" value={inputValues['80tta_deduction']} onChange={(event) => handleInputChange(event, inputValues, setInputValues)} />
                  <label htmlFor="80tta_deduction">Deduction under 80TTA/ SB Interest</label>
                  <span className="helper-text">(Note: Max deduction for 80TTA is 10,000)</span>
                </div>
                <div className="input-field col s12">
                  <h6>Total: <span className="theme-color-blue"> {inputValues['total_80d_80tta_deduction']} </span></h6>
                </div>
              </div>

              <div className="row p-1 border-2 m-0">
                <h6>Tax deducted at source</h6>
                <div className="input-field col s6">
                  <input id="tds" type="number" value={inputValues['tds']} onChange={(event) => handleInputChange(event, inputValues, setInputValues)} />
                  <label htmlFor="tds">TDS</label>
                </div>
              </div>

            </form>
          </div>
        </div>
        <div className="col l4 m4 s12">
          <h5>
            Summary
          </h5>
          <div className="p-1 border-2 m-0">
            <h5>Total Taxable Income: <span>{inputValues['gross_total_income']}</span> - <span>{summary['totalDeductions']}</span> = <span className="theme-color-blue"> {summary['totalTaxableIncome']} </span></h5>
            <span className="helper-text">(Gross total income - Total deductions)</span>
          </div>
          <div className="p-1 border-2 m-0">
            <h5>Tax Computation</h5>
            <h6>0 to 2.5 Lakhs</h6>
            <p>Nil</p>
            <h6>2.5 to 5 Lakhs</h6>
            <p> {summary['taxSlabOne']} </p>
            <h6>5 to 10 Lakhs</h6>
            <p> {summary['taxSlabTwo']} </p>
            <h6>Above 10 Lakhs</h6>
            <p> {summary['taxSlabThree']} </p>
            <h6>Health & Education Cess (4%)</h6>
            <p> {summary['healthAndEduCess']} </p>
            <h6>Total(not excluding TDS): <span> {summary['totalTax']} </span></h6>
            <h6>TDS: <span className="theme-color-blue"> {inputValues['tds']} </span></h6>
          </div>
          <div className="p-1 border-2 m-0">
            <h5>Total Tax Payable: <span className="theme-color-blue"> {summary['totalTaxPayable']} </span></h5>
          </div>
          <div className="p-1 border-2 m-0">
            <h5>Total Refund: <span className="theme-color-blue"> {summary['totalRefund']} </span></h5>
          </div>
          <div className="p-y-1">
            <div className="waves-effect waves-light btn theme-color-blue-bg" onClick={() => computeAndSetSummary(inputValues, setSummary)}>Compute Tax Summary</div>
          </div>
          <div className="p-y-1">
            <p className="color-red">Note: The value of any empty input field will be considered as 0 for computation</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
