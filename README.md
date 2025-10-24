<a href="https://demo-nextjs-with-supabase.vercel.app/">
  <img alt="Next.js and Supabase Starter Kit - the fastest way to build apps with Next.js and Supabase" src="https://demo-nextjs-with-supabase.vercel.app/opengraph-image.png">
  <h1 align="center">Next.js and Supabase Starter Kit</h1>
</a>

<p align="center">
 The fastest way to build apps with Next.js and Supabase
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#demo"><strong>Demo</strong></a> ·
  <a href="#deploy-to-vercel"><strong>Deploy to Vercel</strong></a> ·
  <a href="#clone-and-run-locally"><strong>Clone and run locally</strong></a> ·
  <a href="#financial-intelligence"><strong>Financial Intelligence</strong></a> ·
  <a href="#feedback-and-issues"><strong>Feedback and issues</strong></a>
</p>
<br/>

## Features

- Works across the entire [Next.js](https://nextjs.org) stack
  - App Router
  - Pages Router
  - Middleware
  - Client
  - Server
  - It just works!
- supabase-ssr. A package to configure Supabase Auth to use cookies
- Password-based authentication block installed via the [Supabase UI Library](https://supabase.com/ui/docs/nextjs/password-based-auth)
- Styling with [Tailwind CSS](https://tailwindcss.com)
- Components with [shadcn/ui](https://ui.shadcn.com/)
- Optional deployment with [Supabase Vercel Integration and Vercel deploy](#deploy-your-own)
  - Environment variables automatically assigned to Vercel project
- **Financial Intelligence Platform** with AI-powered analysis
  - Jupyter notebook for comprehensive financial analysis
  - Azure Cosmos DB integration for scalable data storage
  - Real-time KPI calculations and risk assessment
  - AI-powered insights and recommendations

## Demo

You can view a fully working demo at [demo-nextjs-with-supabase.vercel.app](https://demo-nextjs-with-supabase.vercel.app/).

## Deploy to Vercel

Vercel deployment will guide you through creating a Supabase account and project.

After installation of the Supabase integration, all relevant environment variables will be assigned to the project so the deployment is fully functioning.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fnext.js%2Ftree%2Fcanary%2Fexamples%2Fwith-supabase&project-name=nextjs-with-supabase&repository-name=nextjs-with-supabase&demo-title=nextjs-with-supabase&demo-description=This+starter+configures+Supabase+Auth+to+use+cookies%2C+making+the+user%27s+session+available+throughout+the+entire+Next.js+app+-+Client+Components%2C+Server+Components%2C+Route+Handlers%2C+Server+Actions+and+Middleware.&demo-url=https%3A%2F%2Fdemo-nextjs-with-supabase.vercel.app%2F&external-id=https%3A%2F%2Fgithub.com%2Fvercel%2Fnext.js%2Ftree%2Fcanary%2Fexamples%2Fwith-supabase&demo-image=https%3A%2F%2Fdemo-nextjs-with-supabase.vercel.app%2Fopengraph-image.png)

## Clone and run locally

1. You'll first need a Supabase project which can be made [via the Supabase dashboard](https://database.new)

2. Create a Next.js app using the Supabase Starter template npx command

   ```bash
   npx create-next-app --example with-supabase with-supabase-app
   ```

3. Use `cd` to change into the app's directory

   ```bash
   cd with-supabase-app
   ```

4. Rename `.env.example` to `.env.local` and update the following:

   ```
   NEXT_PUBLIC_SUPABASE_URL=[INSERT SUPABASE PROJECT URL]
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[INSERT SUPABASE PROJECT API ANON KEY]
   ```

   Both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` can be found in [your Supabase project's API settings](https://supabase.com/dashboard/project/_?showConnect=true)

5. You can now run the Next.js local development server:

   ```bash
   npm run dev
   ```

   The starter kit should now be running on [localhost:3000](http://localhost:3000/).

## Financial Intelligence

This repository includes an advanced Financial Intelligence platform powered by AI and modern data storage:

### Architecture

- **Frontend**: Next.js with TypeScript and shadcn/ui components
- **Authentication**: Supabase Auth with row-level security
- **Data Storage**: 
  - Supabase for transactional data and user management
  - Azure Cosmos DB for financial analytics and time-series data
- **Analytics Engine**: Jupyter notebook with pandas, numpy, and AI insights
- **AI Integration**: Following AI Toolkit best practices for agent development

### Quick Start

1. **Set up environment variables**:

   ```bash
   # Copy the environment template
   cp .env.example .env.local
   
   # Add your Supabase credentials
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-key
   
   # Add Azure Cosmos DB credentials (optional)
   COSMOS_DB_ENDPOINT=your-cosmos-endpoint
   COSMOS_DB_KEY=your-cosmos-key
   ```

2. **Install dependencies**:

   ```bash
   npm install
   pip install pandas numpy jupyter matplotlib seaborn
   ```

3. **Run the financial analysis**:

   ```bash
   # Start the web application
   npm run dev
   
   # Run the financial intelligence notebook
   jupyter notebook notebooks/abaco_financial_intelligence.ipynb
   ```

### Features

- **Real-time KPI Dashboard**: Monitor AUM, default rates, and portfolio health
- **Customer Segmentation**: AI-powered risk analysis and customer categorization  
- **Risk Assessment**: Delinquency tracking, roll-rate analysis, and predictive modeling
- **Market Intelligence**: Integration with economic indicators and market research
- **Automated Reporting**: Generate comprehensive financial reports with insights
- **Multi-tenant Architecture**: Support for multiple organizations with data isolation

### Data Models

The system uses hierarchical partition keys in Cosmos DB for optimal performance:

```typescript
// Partition Key Structure: tenantId/customerSegment/analysisDate
// Examples:
// "abaco_financial/enterprise/2024-10-24"
// "abaco_financial/sme/2024-10-24"
```

This approach provides:
- **Scalability**: Overcome the 20GB partition limit
- **Performance**: Fast queries within customer segments
- **Cost Efficiency**: Minimize cross-partition operations

## API Routes

### Financial Intelligence Endpoints

- `GET /api/financial/dashboard` - Portfolio overview and KPIs
- `GET /api/financial/customers` - Customer profiles and risk scores
- `POST /api/financial/analysis` - Trigger new analysis run
- `GET /api/financial/reports` - Download generated reports

## Deployment

### Vercel Deployment

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `COSMOS_DB_ENDPOINT` (optional)
   - `COSMOS_DB_KEY` (optional)

3. Deploy:

   ```bash
   vercel deploy
   ```

### Database Setup

1. **Supabase Setup**:
   - Create a new Supabase project
   - Run the SQL schema from `lib/supabase/financial-schema.sql`
   - Enable Row Level Security (RLS)

2. **Azure Cosmos DB Setup** (optional):
   - Create a Cosmos DB account with SQL API
   - Create database: `abaco-financial`
   - Create container: `financial-intelligence`
   - Set partition key: `/partitionKey`

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Feedback and issues

Please file feedback and issues over on the [Supabase GitHub org](https://github.com/supabase/supabase/issues/new/choose).

## More Supabase examples

- [Next.js Subscription Payments Starter](https://github.com/vercel/nextjs-subscription-payments)
- [Cookie-based Auth and the Next.js 13 App Router (free course)](https://youtube.com/playlist?list=PL5S4mPUpp4OtMhpnp93EFSo42iQ40XjbF)
- [Supabase Auth and the Next.js App Router](https://github.com/supabase/supabase/tree/master/examples/auth/nextjs)
