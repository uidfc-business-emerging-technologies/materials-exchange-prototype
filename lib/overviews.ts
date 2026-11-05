// Invented sample content for the prototype. All people, companies, and most institutions are fictional.

/** A fuller overview for each material's page: a few paragraphs and its learning objectives. Keyed by resource ID. */
export interface Overview {
  /** Two or three short paragraphs. */
  about: string[];
  /** Three or four learning objectives, each one sentence starting with a verb. */
  objectives: string[];
}

export const OVERVIEWS: Record<string, Overview> = {
  "TME-0142": {
    about: [
      "Lakeside Fitness sells a twelve-month membership bundled with four personal training sessions and a branded water bottle. The controller has to decide how much revenue to recognize each month. Students work from the membership data to identify each promise in the bundle, estimate standalone selling prices, and turn the allocation into a monthly schedule.",
      "The bundle sells for $1,188, and the data covers 2,400 members who joined from January through June. Students decide whether the sessions and the bottle are distinct from the membership, price each one from Lakeside’s price list, and spread the bundle discount across all three. The schedule recognizes the membership evenly over twelve months, the bottle when it is handed over, and each session when it is used.",
      "The teaching note suggests a 75-minute plan: 15 minutes on the five-step model of ASC 606, 35 in small groups on the allocation, and 25 on the schedule and journal entries.",
    ],
    objectives: [
      "Identify distinct performance obligations in a bundled membership.",
      "Allocate the transaction price using standalone selling prices.",
      "Build the revenue schedule in Excel.",
      "Record the monthly journal entries for deferred and earned revenue.",
    ],
  },

  "TME-0157": {
    about: [
      "Northfield Ceramics sells most of its handmade tableware through two national chains. In March one cut its orders in half, and by the December 31 year-end the company had breached the debt service coverage covenant on its $4.2 million term loan. The bank has not waived the breach. The audit senior has to decide whether there is substantial doubt about Northfield’s ability to continue as a going concern for one year after the financial statements are issued.",
      "Students work from management’s twelve-month cash flow forecast, an excerpt from the loan agreement, and a memo with management’s plans: sell a kiln line, delay a warehouse move, and borrow $600,000 from the founder. They stress the forecast’s key assumptions in Excel, judge whether each plan is probable of being carried out and of closing the gap, and draft a conclusion.",
      "The teaching note explains how ASC 205-40 and AU-C 570 divide the evaluation between management and the auditor, and walks through the effect on the notes and the audit report.",
    ],
    objectives: [
      "Identify conditions and events that raise substantial doubt about going concern.",
      "Test the key assumptions in management’s cash flow forecast.",
      "Evaluate whether management’s plans alleviate substantial doubt.",
      "Explain how the conclusion changes the notes and the auditor’s report.",
    ],
  },

  "TME-0118": {
    about: [
      "Harlow Brewing started in 2023 as a three-member LLC taxed as a partnership. Two members put in cash. The third contributed a used brewhouse with a low tax basis and a $60,000 loan still attached. Over three years the brewery borrowed to expand, made uneven distributions, and in 2025 the other two members bought out the partner who brought the equipment, for $410,000.",
      "Students work from the operating agreement, three years of Schedule K-1 figures, and the buyout terms in the case exhibits. They track each partner’s outside basis and capital account year by year, allocate liabilities under Section 752, and apply Section 704(c) to the built-in gain on the brewhouse. For the buyout, they compute the seller’s gain, including ordinary income from depreciation recapture under Section 751, and the Section 743(b) adjustment under the partnership’s Section 754 election.",
      "The teaching note flags where students most often slip: liability shifts and the built-in gain.",
    ],
    objectives: [
      "Compute each partner’s outside basis after contributions, allocations, and distributions.",
      "Allocate partnership liabilities and explain how changes in them shift basis.",
      "Compare inside and outside basis and explain why they diverge.",
      "Calculate the selling partner’s gain and the Section 743(b) adjustment in a buyout.",
    ],
  },

  "TME-0127": {
    about: [
      "The audit team for Westbrook Medical Supply, a distributor with about $280 million in revenue, has to test journal entries for signs of management override. The fiscal 2025 general ledger holds about 190,000 lines. The engagement manager wants a short list of entries worth pulling support for, not a printout of everything.",
      "Students work from a case brief, the journal entry file, and a starter notebook in Jupyter. In the first session they load the data with pandas, tie account totals to the trial balance to confirm the file is complete, and profile who posts and when. In the second they write tests for weekend and after-close postings, round-dollar amounts, rarely used accounts, and posters outside the accounting team. Then they score the hits and choose a sample.",
      "The teaching note maps each test to a fraud risk and shows how to keep the final list small enough to follow up.",
    ],
    objectives: [
      "Test a journal entry population for completeness before analyzing it.",
      "Write pandas filters for timing, amount, account, and user risk factors.",
      "Combine test results into a risk score and choose entries for follow-up.",
      "Explain how journal entry testing responds to the risk of management override.",
    ],
  },

  "TME-0133": {
    about: [
      "Birchway Home & Garden runs 18 stores across three states. Last year its inventory shrinkage, the gap between book inventory and the physical count, rose from 1.4% to 2.1% of sales. The regional manager can send a loss prevention team to four stores this quarter and wants to know which four.",
      "Students load the store data workbook into Power BI. It holds two years of sales, book inventory, and count results by store and department, along with store size and staff turnover. They calculate shrinkage as a percent of sales, build a map and a ranked bar chart, and add filters for region and department. Then they write a short note naming the stores that need a closer look and why.",
      "The exercise fits one 50-minute lab. The solution walkthrough shows the finished dashboard and each calculated measure step by step.",
    ],
    objectives: [
      "Calculate inventory shrinkage from book and physical counts as a percent of sales.",
      "Build a store-level dashboard in Power BI with a map, a ranked chart, and filters.",
      "Explain why dollar and percent rankings can point to different stores.",
      "Recommend which stores need a closer look and support the choice with data.",
    ],
  },

  "TME-0149": {
    about: [
      "Internal audit at Calloway Engineering, a consulting firm with 1,900 employees, has time to review expense claims from three of its eleven departments this year. Last year the firm set a $75 receipt threshold, and the CFO has heard that some people split meals and taxi rides to stay under it. The dataset holds 40,000 travel and expense claims from fiscal 2025.",
      "Students load the claims in Jupyter with pandas, pull the first digit of each amount, and compare the counts to Benford’s expected frequencies for the firm and for each department. They measure the fit with the mean absolute deviation and a chi-square test, chart the results in Tableau, and write a short memo choosing three departments to sample.",
      "The teaching note covers when Benford’s law should not apply, such as fixed per diems, and how a spike at 7 can lead straight back to the $75 threshold.",
    ],
    objectives: [
      "Explain why many financial datasets follow Benford’s law and when they don’t.",
      "Compute first-digit frequencies in pandas and compare them to expected values.",
      "Measure conformity with the mean absolute deviation and a chi-square test.",
      "Choose departments to sample and justify the choice in a short memo.",
    ],
  },

  "TME-0109": {
    about: [
      "Copperline Supply sells copper pipe, fittings, and wire to about 600 contractors. Its new controller has inherited an order-to-cash process that nobody has written down, and the external auditors want a flowchart before their interim visit in November. She has interview notes from five people: a sales rep, the credit manager, the warehouse lead, the billing clerk, and the accounts receivable clerk.",
      "Students read the notes and diagram the process in Lucidchart, from order entry and credit approval through picking, shipping, billing, and cash receipts. They use a swimlane for each role and mark every document and system handoff. Then they compare the diagram to a short list of control objectives and flag the gaps, such as a billing clerk who can also issue credit memos.",
      "The teaching note gives a 50-minute plan, and the solution includes a model flowchart and the control that would close each gap.",
    ],
    objectives: [
      "Draw a swimlane flowchart of an order-to-cash process from interview notes.",
      "Identify the documents, approvals, and system handoffs at each step.",
      "Find control gaps by comparing the process to its control objectives.",
      "Recommend a specific control to close each gap.",
    ],
  },

  "TME-0161": {
    about: [
      "It is the last week of the third quarter at Ostrander Instruments, a publicly traded maker of lab equipment. The company guided to $212 million in revenue, and the latest forecast says $203 million. The sales team wants to ship two large orders early, and some think the warranty reserve could come down. The earnings call is in three weeks.",
      "Students work in groups of three. One plays the CFO, one the audit engagement partner, and one a sell-side analyst who covers the stock. Each role sheet holds private facts and goals the others don’t see. Over three rounds the CFO decides what to book and what to say, the partner decides what to challenge, and the analyst decides what to ask. The class then compares what each group did.",
      "The teaching note holds the role sheets, a 90-minute run of show, and debrief questions on earnings management, Regulation FD, and when a judgment call becomes a misstatement.",
    ],
    objectives: [
      "Distinguish reasonable accounting estimates from earnings management near quarter end.",
      "Explain the auditor’s role when management faces pressure to meet guidance.",
      "Apply Regulation FD to conversations between management and analysts.",
      "Defend a decision on what to book and what to disclose under time pressure.",
    ],
  },

  "TME-0166": {
    about: [
      "Brennan Valve & Fitting, a manufacturer with $640 million in sales, keeps about $50 million in cash for working capital. In May its treasurer moved $18 million into tokens on a public blockchain, each backed one-to-one by short-term Treasury bills held by a custodian. The tokens settle in minutes and accrue interest daily. The controller has to decide how to present them at the June 30 quarter end.",
      "Students read the token’s offering terms, the custody agreement, and the treasurer’s memo. They test the holding against each candidate treatment: cash equivalent, debt security, investment in fund shares, and crypto asset measured at fair value. For each one they work out the measurement and the effect on the financial statements in Excel, then write a memo recommending one.",
      "The teaching note explains why the token’s legal form matters most, and why the crypto asset guidance in ASC 350-60 likely does not apply to a token that gives rights to an underlying asset.",
    ],
    objectives: [
      "Identify what a holder of a tokenized Treasury bill owns from its legal terms.",
      "Evaluate whether the tokens meet the definition of a cash equivalent.",
      "Compare the measurement of the tokens under each candidate treatment.",
      "Recommend a classification and draft the supporting memo.",
    ],
  },

  "TME-0072": {
    about: [
      "Alder & Finch Outfitters sells jackets, boots, and wool accessories through 12 stores and a website. A warm winter left it with $3.1 million of seasonal stock at its January 31 year-end, and the merchandising team plans to clear much of it at 40 to 60% off. The company uses FIFO, so the inventory is carried at the lower of cost and net realizable value. The controller has to decide how much to write down.",
      "Students work from an item-level file of about 400 products with cost, current price, planned markdowns, and selling costs. They compute net realizable value for each item, compare it to cost, and total the write-down by category in Excel. Then they record the journal entry and draft a short inventory note for the financial statements.",
      "The solution workbook shows the item-level calculations and a model disclosure note.",
    ],
    objectives: [
      "Apply lower of cost and net realizable value to an item-level inventory.",
      "Estimate net realizable value from planned markdowns and selling costs.",
      "Record the write-down and explain why it is not reversed if prices recover.",
      "Draft an inventory disclosure note.",
    ],
  },

  "TME-0075": {
    about: [
      "Maplewood Animal Clinic, a four-vet practice, prices each service by adding a flat 140% overhead rate to its direct labor and supplies. Revenue is up, but profit has fallen two years in a row. Dr. Anika Joshi, the managing partner, suspects that dental cleanings and surgeries are underpriced while routine exams carry too much of the overhead.",
      "Students get a year of clinic data: overhead by cost pool, activity drivers such as anesthesia minutes, lab tests, and appointments, and the services each driver supports. They build an activity-based costing model in Excel, compare each service’s cost to the current method, and test new prices against what nearby clinics charge. The case ends with a recommendation to the partners.",
      "The teaching note covers when activity-based costing is worth the effort for a small business, and how to change prices without losing loyal clients.",
    ],
    objectives: [
      "Assign overhead to activity cost pools and choose a driver for each.",
      "Compute service costs under activity-based costing and compare them to a single overhead rate.",
      "Explain why a single rate distorts the cost of complex, low-volume services.",
      "Recommend price changes that account for both cost and competition.",
    ],
  },

  "TME-0079": {
    about: [
      "This module gives students six short scenarios from the first year of a job at a mid-size accounting firm. A client offers a staff auditor courtside tickets. A senior asks a new hire to record fewer hours than she worked so the job stays on budget. A manager suggests skipping a test because it was clean last year. None has an obvious villain, and each asks what the new hire should do next.",
      "Students meet in groups of four. Each group takes two scenarios, names the people affected and the rules at stake, and agrees on a response the new hire could actually say out loud. Groups report back, and the class compares answers for the same scenario.",
      "The teaching note ties each scenario to the AICPA Code of Professional Conduct and suggests follow-up questions. It works well early in an introductory course or just before internship season.",
    ],
    objectives: [
      "Identify the ethical issue and the people affected in a workplace scenario.",
      "Connect each scenario to the principles in the AICPA Code of Professional Conduct.",
      "Compare options for responding to pressure from a supervisor.",
      "Practice raising a concern in plain, respectful words.",
    ],
  },

  "TME-0083": {
    about: [
      "Granite Peak Hardware has three stores and about $8.6 million of inventory at its December 31 year-end. The audit senior has to plan the observation of the physical count: which stores to attend, how many test counts to make, and how to handle cutoff while two stores stay open on the 31st. A week after the count, the team’s exceptions arrive.",
      "Students first read the client’s count instructions and plan the observation, including floor-to-sheet and sheet-to-floor test counts. Then they work from the count results workbook, which lists 46 exceptions: miscounts, damaged paint cans, items on the wrong tag, and receipts that arrived after the count. For each one they decide whether it is an error, project the errors to the population, and judge whether inventory is fairly stated.",
      "The teaching note includes a timed plan and a model planning memo.",
    ],
    objectives: [
      "Plan an inventory observation across several locations.",
      "Explain how sheet-to-floor and floor-to-sheet test counts address existence and completeness.",
      "Evaluate count exceptions and cutoff issues found during the count.",
      "Project the errors and conclude whether inventory is fairly stated.",
    ],
  },

  "TME-0091": {
    about: [
      "Jess Alvarado left a studio job in 2025 to shoot weddings and corporate events on her own. She earned $96,000 in her first year, kept her receipts in a shoebox and a banking app, and now wants help with her return. She wants to know if she can deduct the spare bedroom she edits in, the SUV she drives to shoots, and the $7,800 camera body she bought in March.",
      "Students work from a spreadsheet of her bank and card transactions, a mileage log, and interview notes. They sort each item onto a Schedule C line or out of the return, test the home office against the regular and exclusive use rules, and compare the simplified method to actual expenses. They make the same choice for the vehicle and decide how to depreciate the camera. The result is a completed Schedule C and a short client letter.",
      "The teaching note flags the items built to start arguments, such as a family trip with one paid shoot.",
    ],
    objectives: [
      "Classify a sole proprietor’s spending as business expenses, personal costs, or capital items.",
      "Apply the regular and exclusive use test to a home office and compare the two deduction methods.",
      "Compare the standard mileage rate with actual vehicle expenses.",
      "Prepare a Schedule C and explain the results to the client in plain language.",
    ],
  },

  "TME-0094": {
    about: [
      "Fenwick Industrial runs its finance work on a mid-size ERP system with 140 users and 62 roles. Over five years people changed jobs and kept their old access, and no one has reviewed the roles since the system went live. The external auditors arrive in March, and the IT manager wants to find the problems first.",
      "Students get an export of users, their roles, and the permissions inside each role, plus a short rule set of incompatible duties. For example, no one should both create vendors and approve payments, or both post and approve journal entries. They use lookups and pivot tables in Excel to map users to permissions, flag every conflicting pair, and rank the conflicts by risk. Then they propose role changes, and compensating controls where a small team can’t split the work.",
      "The teaching note explains how auditors judge which conflicts matter, and the solution lists every conflict in the data.",
    ],
    objectives: [
      "Explain why incompatible duties create a risk of error and fraud.",
      "Map users to permissions through their roles using Excel lookups.",
      "Identify segregation of duties conflicts against a rule set and rank them by risk.",
      "Recommend role changes or compensating controls for each conflict.",
    ],
  },

  "TME-0097": {
    about: [
      "St. Brigid Regional Medical Center, a 320-bed hospital, ran short of isolation gowns twice last winter and paid rush prices to restock. The supply chain director wants a monthly forecast of glove and gown use for the next year so purchasing can order ahead. The dataset holds eight years of monthly usage by item, with patient days and flu season markers.",
      "In the first session, students plot the series in R, look for trend and seasonality, decide how to treat the 2020 spike, and hold out the last 12 months as a test set. They fit a seasonal naive model, exponential smoothing, and an ARIMA model, then compare them on forecast error. In the second session they add patient days as a predictor, build prediction intervals, and turn the best forecast into an order plan with safety stock.",
      "The teaching note covers how to explain forecast uncertainty to a manager who just wants one number.",
    ],
    objectives: [
      "Identify trend and seasonality in a monthly time series.",
      "Fit and compare seasonal naive, exponential smoothing, and ARIMA models in R.",
      "Evaluate forecasts on a holdout set using error measures such as MAPE.",
      "Turn a forecast and its prediction interval into an order plan.",
    ],
  },

  "TME-0104": {
    about: [
      "The auditors of Ashgrove Literacy Project, a nonprofit with a $2.4 million budget and a volunteer board, have finished fieldwork. They found eleven control issues, from one person handling all donations to a lapsed insurance policy. The draft letter lists them in the order they were found, in audit jargon, and the board chair has said she won’t read past page one.",
      "Students sort the findings by risk and separate the significant deficiencies and material weaknesses the auditors must report in writing from smaller suggestions. They rewrite each finding as a condition, its risk, and a recommendation in plain words. Then they draft the letter in pairs, trade drafts with another pair, and revise after feedback.",
      "The teaching note includes a grading guide and examples of weak and strong findings. The solution is a model letter of under two pages.",
    ],
    objectives: [
      "Prioritize control findings by their risk to the organization.",
      "Distinguish deficiencies that must be reported in writing from other recommendations.",
      "Write each finding as a condition, its risk, and a recommendation a board can act on.",
      "Revise a draft for a reader with no accounting background.",
    ],
  },

  "TME-0106": {
    about: [
      "Larkspur Packaging sells corrugated boxes to 38 distributors and pays each a quarterly rebate when its volume crosses set tiers. Rebate disputes were common, so in 2026 Larkspur moved the program to a smart contract on a permissioned blockchain. The contract reads shipment data from the ERP system and pays rebates in a stablecoin at each quarter end. The CFO says this makes the rebate accrual automatic. The auditors are not so sure.",
      "Students read the case, the rebate terms, and a description of the contract’s logic and data feed. They work through three questions. Does the contract change how Larkspur estimates variable consideration under ASC 606? Which controls move from people to code, and who tests the code and the feed? What evidence should the auditor gather when the blockchain record and the ERP disagree?",
      "The teaching note gives a 75-minute plan and a model answer for each question.",
    ],
    objectives: [
      "Estimate variable consideration for tiered volume rebates under ASC 606.",
      "Identify the controls that shift to code and data feeds when a smart contract pays rebates.",
      "Evaluate the reliability of blockchain records as audit evidence.",
      "Recommend tests for the contract’s logic and its data feed.",
    ],
  },

  "TME-0112": {
    about: [
      "Rolling Fork Eats runs six food trucks around a mid-size city, each with its own menu. For June the owner budgeted $186,000 in sales and $41,000 in profit. Sales came in close to budget, but profit fell to $29,000, and every truck manager has a different explanation: rain, the price of beef, a new taco special.",
      "Students start from point-of-sale and cost data for each truck. They build a flexible budget in Excel at the actual volume, then split the gap between budget and actual into sales price, volume, and mix variances. They bring the results into Power BI, build a report page that shows the variances by truck, and write two sentences for each manager on what really happened.",
      "The exercise fits one 50-minute lab. The solution file shows the flexible budgets, the variance calculations, and a finished report.",
    ],
    objectives: [
      "Build a flexible budget at the actual level of activity.",
      "Calculate and interpret sales price, volume, and mix variances.",
      "Present variances by truck in a Power BI report.",
      "Explain in plain words what caused each truck’s results.",
    ],
  },

  "TME-0115": {
    about: [
      "Thistle Outdoor Gear sells jackets, packs, and tents online and through 70 retail partners. Its largest retail customer now asks every supplier for a greenhouse gas inventory, and the founders want to publish a first sustainability report by spring. Thistle owns no factories, so almost all of its footprint sits with suppliers, in Scope 3.",
      "Students work from a year of purchasing data: $84 million of spend across 210 suppliers, coded by category. They match the spend to industry emission factors to build a spend-based estimate in Excel. Then they swap in supplier-specific data for the five largest suppliers and see how far the total moves. The case ends with a draft of the claims Thistle can make, and the ones it can’t.",
      "The teaching note covers the GHG Protocol’s Scope 3 categories and the limits of spend-based factors. Its 90-minute plan ends with a debate over a proposed carbon neutral label.",
    ],
    objectives: [
      "Explain the difference between Scope 1, 2, and 3 emissions under the GHG Protocol.",
      "Estimate emissions from purchased goods using spend data and emission factors.",
      "Compare spend-based estimates with supplier-specific data and explain the gap.",
      "Evaluate which sustainability claims the data can support.",
    ],
  },

  "TME-0121": {
    about: [
      "Tri-County Community Credit Union has 58,000 members and lost about 7% of them last year, many to online banks paying higher savings rates. The marketing team can fund retention offers for about 3,000 members. It wants to know who is most likely to leave before the next rate change.",
      "Students start in Tableau with two years of member data: age, tenure, products held, balances, direct deposit, branch visits, and app logins. They look for the patterns that set closed accounts apart. Then they move to Python and fit a logistic regression that predicts closure, checking it on a holdout set with a confusion matrix and the share of leavers caught in the top 3,000 scores.",
      "The teaching note discusses which predictors are fair to use, and how to explain a model’s limits to a marketing team.",
    ],
    objectives: [
      "Explore member data in Tableau to find patterns linked to churn.",
      "Fit a logistic regression in Python to predict which members will close their accounts.",
      "Evaluate the model on a holdout set with a confusion matrix and lift in the top-ranked group.",
      "Recommend which members to target and explain the model’s limits.",
    ],
  },

  "TME-0124": {
    about: [
      "The Lindqvist family has farmed Ridgeview for three generations. In 2026 they agree to trade 160 acres of cropland and a combine to a neighbor for 240 acres of pasture closer to their dairy, plus $85,000 in cash. The neighbor also takes over the $120,000 mortgage on the cropland. The family’s accountant has to work out how much gain they recognize now and what basis they carry forward.",
      "Students start by splitting the trade into its parts. Since 2018, Section 1031 covers only real property, so the land may qualify but the combine is a taxable sale with depreciation recapture. For the land, they compute the realized gain, treat the cash and the debt relief as boot, recognize gain up to the boot received, and figure the basis of the pasture. They build the calculations in Excel and check them against Form 8824.",
      "The teaching note includes a worked answer and a variation where the family pays cash instead.",
    ],
    objectives: [
      "Determine which parts of a mixed trade qualify for like-kind treatment under Section 1031.",
      "Compute realized gain, boot received, and recognized gain in a like-kind exchange.",
      "Calculate the basis of property received, including the effect of liabilities assumed.",
      "Explain the tax on equipment that no longer qualifies for like-kind treatment.",
    ],
  },

  "TME-0130": {
    about: [
      "Saltmarsh Hotels owns six beachfront properties along the Gulf Coast. An early-season hurricane and a closed causeway pushed summer occupancy at two of them below 50%, and the company’s lender has asked about carrying values. At the September 30 year-end, the controller has to decide which hotels to test for impairment and whether any must be written down.",
      "Students work from five years of occupancy, room rates, and operating costs by property, plus management’s ten-year forecasts. They decide which hotels show indicators of impairment and test recoverability with undiscounted cash flows, treating each hotel as its own asset group. Where a hotel fails, they measure the loss as carrying amount over fair value from a discounted cash flow model. They finish with the journal entry and the disclosure.",
      "The teaching note focuses on the judgments that drive the answer: the forecast, the discount rate, and what one more weak season would do.",
    ],
    objectives: [
      "Identify events and changes in circumstances that call for an impairment test under ASC 360.",
      "Apply the undiscounted cash flow recoverability test to each asset group.",
      "Measure an impairment loss using a discounted cash flow estimate of fair value.",
      "Record the impairment and explain how sensitive it is to key assumptions.",
    ],
  },

  "TME-0136": {
    about: [
      "Kettle Creek Logistics, a trucking and warehousing company, processes about 9,000 vendor invoices a month with five clerks. Invoices arrive by email, by mail, and through a vendor portal, and the backlog runs eight days at month end. The CFO has bought a UiPath license and wants a software bot to take on as much of the work as it safely can.",
      "Students map the current process in Lucidchart, from receipt through three-way match, approval, and payment. They mark each step as rule-based and suited to the bot, or as needing judgment. For the steps the bot takes on, they decide which controls must change: who can edit the bot’s rules, how its credentials are managed, and how exceptions reach a person. Students who want more can build a short UiPath workflow for the matching step.",
      "The teaching note includes a model future-state diagram and a control matrix.",
    ],
    objectives: [
      "Map an accounts payable process and identify which steps are rule-based.",
      "Decide which tasks a software bot should do and which need human judgment.",
      "Design controls over bot access, changes to its rules, and exception handling.",
      "Explain how automation changes the audit trail for invoice approval.",
    ],
  },

  "TME-0139": {
    about: [
      "Internal audit at Bramley Foods, a regional grocery wholesaler that pays about 4,200 vendors, suspects some invoices are being paid twice. A recovery firm has offered to look for a 30% contingency fee. Before signing, the chief audit executive wants her own team to test a year of accounts payable data: 210,000 payments, the vendor master, and the invoice table.",
      "In the first session, students load the tables into a SQL database, check row counts and totals against the general ledger, and write queries that join payments to invoices and vendors. They search for exact duplicates, then near matches: the same vendor and amount with a slightly different invoice number, or one invoice paid to two vendor records. In the second session they look for split payments just under the $10,000 approval limit, export the hits to Excel, and rank them for follow-up.",
      "The teaching note shows how to tune the queries to cut false positives.",
    ],
    objectives: [
      "Join payment, invoice, and vendor tables in SQL to build a test population.",
      "Write queries that find exact and near-duplicate payments.",
      "Detect split payments structured to stay under an approval limit.",
      "Rank exceptions for follow-up and explain which are likely false positives.",
    ],
  },

  "TME-0145": {
    about: [
      "The board of Penrose Home Health meets next week, and the finance team’s deck has six charts that each bend the truth a little. Revenue growth sits on a y-axis that starts at $40 million. A pie chart’s slices add up to 112%. Two lines share one chart on two different scales, and a 3D column chart hides a decline.",
      "Students work in pairs. For each chart they name what a board member would wrongly conclude and the design choice that causes it. Then they rebuild each one in Excel or Tableau with honest axes, clear labels, and a chart type that fits the data, and write a one-line takeaway for each.",
      "The module guide includes the deck and the numbers behind every chart. The teaching note offers a 50-minute plan, and the solution shows a redesign of each chart. It works as a single session or as the start of a data visualization unit.",
    ],
    objectives: [
      "Identify design choices that make a chart misleading, such as truncated axes and dual scales.",
      "Explain what a reader would wrongly conclude from each chart.",
      "Redesign charts in Excel or Tableau so the picture matches the numbers.",
      "Write a clear one-line takeaway for each chart.",
    ],
  },

  "TME-0147": {
    about: [
      "Tamarack Bicycles builds high-end gravel and road bikes in a small Colorado factory. A supplier in Taiwan has offered to make its carbon frames for $410 each, against an internal cost of $520 that includes $160 of allocated overhead. Buying would free a layup room and four technicians. The operations VP wants to sign before the spring season.",
      "Students sort the cost data into relevant and irrelevant costs, separate the overhead that would go away from fixed costs that stay, and estimate what the freed capacity could earn on a new frame line. They build the analysis in Excel, then look past the numbers: warranty claims, lead times, tariffs, currency risk, and the brand’s promise of frames made in Colorado.",
      "The teaching note gives a 90-minute plan and works out the supplier price at which the decision flips.",
    ],
    objectives: [
      "Identify relevant costs in a make-or-buy decision, including avoidable fixed costs.",
      "Include the opportunity cost of freed capacity in the analysis.",
      "Assess qualitative risks such as quality, lead time, and supply disruption.",
      "Recommend a decision and state the supplier price at which it would change.",
    ],
  },

  "TME-0151": {
    about: [
      "Each month the FP&A team at Corbel Home Products writes commentary on budget-to-actual variances for 30 cost centers. One analyst has started asking a generative AI assistant to draft the explanations. The drafts read well, but last month one blamed higher freight for a variance that a reclassification entry had caused.",
      "Students get a general ledger extract and a variance report for one month. They write prompts that ask the assistant to explain the five largest variances, then check each claim against the ledger detail. They mark what is right, what is wrong, and what is made up, revise their prompts to give the assistant better context, and compare the second drafts to the first.",
      "The teaching note includes sample prompts and outputs, a checklist for reviewing AI-written commentary, and guidance on keeping company data out of public tools.",
    ],
    objectives: [
      "Write prompts that give a generative AI tool the context it needs to explain variances.",
      "Check AI-drafted variance explanations against general ledger detail.",
      "Identify errors and unsupported claims in AI-generated commentary.",
      "Describe the review steps a finance team should require before using AI-written commentary.",
    ],
  },

  "TME-0153": {
    about: [
      "The Bluff Street Campus Bookstore tracks sales in its register, textbook rentals in a spreadsheet, and returns on paper. The manager, Carla Nguyen, wants answers the current setup can’t give: which rentals never came back, which courses drive the most returns, and what the rental program actually earns each semester.",
      "In the first session, students read the business rules and design a relational database with tables for customers, books, sales, rentals, and returns. They draw an entity relationship diagram, choose primary and foreign keys, and normalize the tables. In the second session they load the dataset and write SQL queries, using joins, grouping, and filters, to answer the manager’s eight questions.",
      "The solution includes a model diagram, the table definitions, and an answer query for each question.",
    ],
    objectives: [
      "Design a relational database from a set of business rules.",
      "Draw an entity relationship diagram with primary and foreign keys.",
      "Normalize tables to remove repeated data.",
      "Write SQL queries with joins and grouping to answer a manager’s questions.",
    ],
  },

  "TME-0155": {
    about: [
      "Students get five cash flow statements with the company names removed, and a list of five companies: a fast-growing software startup, a grocery chain, an electric utility, a cruise line coming out of a bad year, and a mature consumer brand buying back shares. All are fictional, but each statement has the shape its industry would produce.",
      "Working in teams, students read each statement for clues: negative operating cash flow, heavy capital spending, large debt issued or repaid, dividends and buybacks. They have 20 minutes to match every statement to a company. Then each team defends one match while the rest of the class pushes back.",
      "The teaching note gives the answer key, the deciding clue in each statement, and debrief questions. The module fits right after students first meet the cash flow statement.",
    ],
    objectives: [
      "Explain what operating, investing, and financing cash flows reveal about a business.",
      "Relate patterns in a cash flow statement to a company’s industry and stage of growth.",
      "Interpret items such as depreciation add-backs, working capital changes, and share buybacks.",
      "Defend a conclusion using evidence from the statements.",
    ],
  },

  "TME-0159": {
    about: [
      "Ferrous Components ships industrial fasteners from one warehouse and closes its books on December 31. Sales spiked in the last three days of the year, just enough for the sales team to beat its bonus target by $140,000. The audit staff has pulled 24 sales recorded from December 28 to January 4 to test cutoff.",
      "Students get the packet for each sale: the invoice, the bill of lading, the shipping terms, and the carrier’s tracking record. They decide which sales belong in December and which in January, paying close attention to FOB terms and to documents that don’t agree with each other. Then they discuss what else they would ask for, and when a pattern stops looking like a coincidence.",
      "The teaching note gives the answer for each sale and prompts for discussing skepticism without assuming fraud.",
    ],
    objectives: [
      "Explain how shipping terms determine when control transfers and revenue is recognized.",
      "Test sales cutoff by comparing invoices, shipping documents, and carrier records.",
      "Recognize red flags near year-end that call for more skepticism.",
      "Propose additional procedures when the evidence is inconsistent.",
    ],
  },

  "TME-0163": {
    about: [
      "Wick & Ember sells hand-poured candles from a home studio in Ohio. Sales took off in 2025 after a video went viral, and the owners shipped more than 14,000 orders to 47 states. They collect sales tax only in Ohio. Since the Wayfair decision, though, a state can require an out-of-state seller to collect based on its sales into the state alone.",
      "Students work from a year of order data with the date, ship-to state, amount, and whether each sale went through the shop’s own site or a marketplace. Using a table of state thresholds, they total sales and transactions by state in Excel and find the date each threshold was crossed. Some states count marketplace sales toward the threshold and some don’t. Then they map the results in Tableau and list the states where the shop must register.",
      "The solution workbook shows the state totals and crossing dates.",
    ],
    objectives: [
      "Explain economic nexus after South Dakota v. Wayfair.",
      "Apply state thresholds based on sales dollars and transaction counts to order data.",
      "Determine the date the shop crossed each state’s threshold.",
      "Account for marketplace sales, which some states count toward the threshold and others exclude.",
    ],
  },

  "TME-0164": {
    about: [
      "Coldwater Distribution runs a 600,000-square-foot cold storage warehouse with racking 40 feet high. Counting the top levels used to take lifts, overtime, and a weekend shutdown. This year the client counted with drones that scan pallet barcodes, photograph each rack location, and match the scans to the warehouse management system.",
      "The audit senior has to decide how much to rely on the drone count. Students read the case, the drone vendor’s description, and the client’s count results. They work out what the scans show and what they don’t: a scanned label shows a pallet is in its slot, not that it holds what the label says or that the goods are in good condition. Then they design the test counts, data checks, and controls testing the auditor still needs.",
      "The teaching note ties the discussion to the inventory observation requirements in AU-C 501 and offers a 75-minute plan.",
    ],
    objectives: [
      "Explain what an auditor must observe and test at a physical inventory count.",
      "Evaluate whether drone scans provide sufficient appropriate evidence of existence and condition.",
      "Identify the controls over the drone system and its data that the auditor should test.",
      "Design additional procedures to cover what the drone scans miss.",
    ],
  },

  "TME-0088": {
    about: [
      "Corvid Air flies 22 regional jets on leases from three lessors. After a weak year it renegotiated in April. Two jets will go back early, five leases get three more years at lower rent, and Corvid takes two new jets at market rates. The controller needs the new lease balances for the second quarter and a plain explanation for the audit committee of why the balance sheet moved.",
      "Students work from a lease schedule with each aircraft’s original terms, discount rate, and carrying amounts, plus the new terms. They sort each change under ASC 842 as a separate new lease, a modification that extends the term, or an early termination. Then they remeasure the modified lease liabilities at a discount rate as of the modification date, adjust the right-of-use assets, record any gain or loss, and compare the balance sheet before and after.",
      "The teaching note includes a timed plan and a rollforward of the lease liability through the quarter.",
    ],
    objectives: [
      "Determine whether a lease change is a separate contract, a modification, or a termination under ASC 842.",
      "Remeasure a lease liability using the discount rate at the modification date.",
      "Adjust the right-of-use asset and record any gain or loss on early termination.",
      "Explain the effect of the renegotiation on the balance sheet to a nonaccounting audience.",
    ],
  },

  "TME-0101": {
    about: [
      "In January 2025 Halcyon Water Systems bought Brightwater Filtration, a maker of home water filters, for $48 million in cash plus an earnout. Brightwater’s founders get up to $12 million more if revenue in 2025 and 2026 beats set targets. Then Brightwater’s largest retail customer delayed a rollout, and the odds of paying the earnout shifted at every quarter end.",
      "Students work from the purchase agreement, management’s revenue scenarios, and the discount rates in the case. They measure the earnout’s fair value at the acquisition date as part of the consideration transferred and see how it changes goodwill. Then they remeasure the liability at each reporting date, separating measurement period adjustments from later changes, which go through earnings. They build the probability-weighted model and the journal entries in Excel.",
      "The teaching note covers why a shrinking earnout liability raises reported income, and how analysts tend to read that gain.",
    ],
    objectives: [
      "Measure contingent consideration at fair value on the acquisition date with a probability-weighted model.",
      "Explain how the earnout affects consideration transferred and goodwill.",
      "Distinguish measurement period adjustments from later changes in fair value.",
      "Record remeasurement gains and losses and trace them through the income statement.",
    ],
  },

  "TME-0171": {
    about: [
      "Halverson Supply’s controller let her team try a generative AI assistant during the September close. It drafted reconciliation notes, explained journal entries, and summarized variances. Students read the prompt log, find where the assistant was wrong or went unchecked, and propose review controls for the next close.",
      "The prompt log exhibit holds 40 exchanges from five team members over six working days. Most of the output helped. Some did not: a bank reconciliation note that cleared a $12,400 item nobody had matched, and a variance summary that invented a reason for higher freight. Students tie each use to the close checklist, rate its risk, and decide which uses need a reviewer, which need a new control, and which should stop.",
      "The teaching note gives a 90-minute plan with a role-play between the controller and the external auditor, and a sample control matrix.",
    ],
    objectives: [
      "Map where generative AI fits in a monthly close checklist.",
      "Find errors in AI-drafted reconciliation notes and journal entry explanations.",
      "Design review controls for AI-assisted close work.",
      "Explain what evidence an external auditor would expect to see for AI-drafted work.",
    ],
  },
};
