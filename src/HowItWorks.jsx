import Reveal from './Reveal'

function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Set your profile',
      text: 'Tell us your academic record, field of study, and where you want to go. Takes less than two minutes.',
      image: '/images/feature-1.jpg',
    },
    {
      number: '02',
      title: 'AI matches you',
      text: 'Our matching engine scans real, active scholarships and finds the ones that genuinely fit your profile.',
      image: '/images/feature-2.jpg',
    },
    {
      number: '03',
      title: 'Apply with confidence',
      text: 'Get clear deadlines, eligibility notes, and practical tips for every match, so you apply prepared.',
      image: '/images/feature-3.jpg',
    },
  ]

  return (
    <section className="how-it-works">
      <Reveal>
        <p className="eyebrow center">The Process</p>
        <h2 className="section-title">How BursMate works</h2>
      </Reveal>

      {steps.map((step) => (
        <Reveal key={step.number}>
          <div className="flow-step" style={{ backgroundImage: `url(${step.image})` }}>
            <div className="flow-overlay"></div>
            <div className="flow-content">
              <span className="step-number">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          </div>
        </Reveal>
      ))}
    </section>
  )
}

export default HowItWorks