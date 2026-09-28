"""Demo Seed Data Generator for SETU AI"""
import asyncio
import uuid
from datetime import datetime, timedelta, timezone
from app.models.base import engine, Base, AsyncSessionLocal
from app.models.models import User, Region, Request, Hotspot, Project, InvestmentPlan, ImpactSnapshot, AuditLog
from app.core.security import get_password_hash
from app.services.ai_service.nlu import nlu_service
from app.services.ai_service.scoring import scoring_service

async def seed_database():
    print("🌱 Initializing database schema...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        print("🏛️ Creating BRICS Regions (India & Brazil)...")
        # Region 1: Maharashtra, India
        region_mh = Region(
            id="reg-in-mh",
            country_code="IN",
            name="Maharashtra",
            level="state",
            population=112374333,
            infra_index_json={
                "deficit_index": 0.78,
                "water_coverage_pct": 54.2,
                "paved_road_pct": 68.0,
                "grid_reliability_pct": 74.5
            },
            demographic_json={
                "vulnerability_index": 0.82,
                "bpl_percentage": 31.4,
                "rural_population_pct": 54.8
            }
        )

        # Region 2: Minas Gerais, Brazil
        region_mg = Region(
            id="reg-br-mg",
            country_code="BR",
            name="Minas Gerais",
            level="state",
            population=21411923,
            infra_index_json={
                "deficit_index": 0.65,
                "water_coverage_pct": 71.0,
                "paved_road_pct": 59.4,
                "grid_reliability_pct": 82.0
            },
            demographic_json={
                "vulnerability_index": 0.68,
                "poverty_rate_pct": 24.1,
                "rural_population_pct": 14.7
            }
        )

        # Region 3: Bihar, India
        region_br = Region(
            id="reg-in-br",
            country_code="IN",
            name="Bihar",
            level="state",
            population=124799926,
            infra_index_json={
                "deficit_index": 0.88,
                "water_coverage_pct": 42.0,
                "paved_road_pct": 51.2,
                "grid_reliability_pct": 61.0
            },
            demographic_json={
                "vulnerability_index": 0.92,
                "bpl_percentage": 42.8,
                "rural_population_pct": 88.7
            }
        )

        session.add_all([region_mh, region_mg, region_br])
        await session.flush()

        print("👤 Creating Demo Users for All 3 Roles...")
        demo_password = get_password_hash("password123")
        
        user_citizen = User(
            id="usr-citizen-1",
            name="Aarav Sharma",
            email="citizen@setu.ai",
            phone="+919876543210",
            role="citizen",
            region_id=region_mh.id,
            language_pref="hi",
            password_hash=demo_password
        )

        user_official = User(
            id="usr-official-1",
            name="Dr. Priya Deshmukh",
            email="official@setu.ai",
            phone="+919876500001",
            role="official",
            region_id=region_mh.id,
            language_pref="en",
            password_hash=demo_password
        )

        user_admin = User(
            id="usr-admin-1",
            name="Minister Carlos Silva",
            email="admin@setu.ai",
            phone="+553198765432",
            role="national_admin",
            region_id=region_mh.id,
            language_pref="en",
            password_hash=demo_password
        )

        session.add_all([user_citizen, user_official, user_admin])
        await session.flush()

        print("📚 Indexing Investment Plans & Masterpolicies for RAG...")
        plans = [
            InvestmentPlan(
                id="plan-mh-water-1",
                region_id=region_mh.id,
                category="water",
                allocated_budget=4500000.0,
                fiscal_year="2025-2027",
                source="Maharashtra State Water Grid Plan 2025 (Gazette #W-104)",
                document_text=(
                    "Under the Jal Jeevan Mission and Maharashtra Rural Piped Water Supply Masterplan 2025-2027 (Article 4.2: Feeder Line Renewal Scheme), "
                    "rural habitations with over 250 unserved or contaminated water households qualify for priority capital expenditure up to Rs 4.5 Crores ($540,000 USD). "
                    "The plan mandates urgent ground water treatment and ductile iron feeder pipelines in the Jalna-Aurangabad drought-prone corridor."
                ),
                embedding_json=nlu_service.get_embedding("Maharashtra State Water Grid Plan 2025 Jal Jeevan Mission rural drinking water pipeline")
            ),
            InvestmentPlan(
                id="plan-mh-roads-1",
                region_id=region_mh.id,
                category="roads",
                allocated_budget=7500000.0,
                fiscal_year="2025-2027",
                source="Pradhan Mantri Gram Sadak Yojana (PMGSY Stage-IV MH Corridor)",
                document_text=(
                    "State Highway 176 and rural connectivity arterial arteries qualify for comprehensive all-weather culvert reconstruction under Section 8.1. "
                    "Funding is earmarked specifically for bridges vulnerable to monsoon overflow causing medical and emergency transport isolation."
                ),
                embedding_json=nlu_service.get_embedding("Pradhan Mantri Gram Sadak Yojana road connectivity bridge culvert state highway")
            ),
            InvestmentPlan(
                id="plan-br-energy-1",
                region_id=region_mg.id,
                category="electricity",
                allocated_budget=3200000.0,
                fiscal_year="2025-2026",
                source="Programa Luz Para Todos — Minas Gerais Vale do Jequitinhonha",
                document_text=(
                    "The Federal Rural Electrification Directive earmarks solar microgrid substations and decentralized battery energy storage systems (BESS) "
                    "for remote municipal health clinics and educational clusters experiencing greater than 15 hours of weekly power outage."
                ),
                embedding_json=nlu_service.get_embedding("Programa Luz Para Todos Minas Gerais rural electrification solar microgrid substation")
            ),
            InvestmentPlan(
                id="plan-in-br-flood-1",
                region_id=region_br.id,
                category="public_safety",
                allocated_budget=9100000.0,
                fiscal_year="2025-2028",
                source="Bihar Koshi River Basin Flood Resilience Plan (Gazette #FL-204)",
                document_text=(
                    "Capital expenditure authorized for automated drainage sluice gates and embankment reinforcement across flood-prone agricultural habitations in North Bihar."
                ),
                embedding_json=nlu_service.get_embedding("Bihar Koshi River Basin Flood Resilience embankment drainage sluice gates")
            )
        ]
        session.add_all(plans)
        await session.flush()

        print("💧 Seeding Citizen Grievances & Ingests (~150 realistic multilingual requests)...")
        # Template complaints
        mh_water_templates = [
            ("आमच्या गावात पिण्याच्या पाण्याची मुख्य पाईपलाईन 3 आठवड्यांपासून फुटली आहे. 350 कुटुंबांना पिण्यासाठी दूषित पाणी वापरावे लागत आहे.", "mr", 0.89),
            ("Our tap water has turned brown and smells foul since last week. Children in Ward 4 are falling sick.", "en", 0.92),
            ("हमारे मोहल्ले में पानी की सप्लाई पिछले 15 दिनों से बंद है, बोरवेल का पानी खारा है।", "hi", 0.84),
            ("Pipeline near Primary Health Centre ruptured. Water logging on road and zero drinking supply.", "en", 0.86),
            ("विहिरीतील पाणी पूर्णपणे आटले आहे, पाण्याचे टँकर वेळेवर येत नाहीत.", "mr", 0.88),
            ("Drinking water pipe broken by road construction contractor. 450 families in severe distress.", "en", 0.90)
        ]

        mh_road_templates = [
            ("State Highway 176 bridge has developed massive potholes. Ambulance took 90 minutes yesterday.", "en", 0.85),
            ("सड़क पर भारी बारिश से कीचड़ भर गया है, स्कूल की बस गांव में नहीं आ पा रही है।", "hi", 0.78),
            ("Culvert near Badnapur intersection is collapsing. Danger of complete transit cutoff.", "en", 0.88)
        ]

        mg_power_templates = [
            ("O posto de saúde de Jequitinhonha está sem energia elétrica há 4 dias, vacinas estragaram.", "pt", 0.86),
            ("Frequent blackouts in rural sector 4. Voltage drops have destroyed irrigation pump motors.", "en", 0.72),
            ("A rede elétrica rural caiu com o vendaval e a concessionária ainda não veio reparar.", "pt", 0.79)
        ]

        created_requests = []
        base_time = datetime.now(timezone.utc) - timedelta(days=14)

        # 80 requests for Maharashtra Water Hotspot #1
        for i in range(80):
            text_tmpl, lang, base_urg = mh_water_templates[i % len(mh_water_templates)]
            # jitter lat/lon around Badnapur, MH (19.8762, 75.3433)
            lat_jitter = 19.8762 + (i % 7 - 3) * 0.003
            lon_jitter = 75.3433 + (i % 9 - 4) * 0.003
            req = Request(
                citizen_id=user_citizen.id if i == 0 else None,
                raw_text=text_tmpl + f" [Report #{i+1}]",
                translated_text=f"The drinking water pipeline in Ward 4 Badnapur is broken; {300+i} families affected with contamination.",
                channel="voice" if i % 2 == 0 else ("whatsapp" if i % 3 == 0 else "web"),
                language=lang,
                category="water",
                urgency_score=round(min(base_urg + (i % 5)*0.02, 0.98), 2),
                lat=lat_jitter,
                lon=lon_jitter,
                region_id=region_mh.id,
                status="clustered",
                created_at=base_time + timedelta(hours=i * 3)
            )
            created_requests.append(req)

        # 45 requests for Maharashtra Road Hotspot #2
        for i in range(45):
            text_tmpl, lang, base_urg = mh_road_templates[i % len(mh_road_templates)]
            lat_jitter = 19.9200 + (i % 5 - 2) * 0.004
            lon_jitter = 75.4100 + (i % 7 - 3) * 0.004
            req = Request(
                raw_text=text_tmpl + f" [Ref {i+1}]",
                translated_text="State Highway 176 culvert washed out with severe transit and ambulance delays.",
                channel="sms" if i % 2 == 0 else "web",
                language=lang,
                category="roads",
                urgency_score=round(base_urg, 2),
                lat=lat_jitter,
                lon=lon_jitter,
                region_id=region_mh.id,
                status="clustered",
                created_at=base_time + timedelta(hours=i * 5)
            )
            created_requests.append(req)

        # 30 requests for Minas Gerais Power Hotspot
        for i in range(30):
            text_tmpl, lang, base_urg = mg_power_templates[i % len(mg_power_templates)]
            lat_jitter = -16.4300 + (i % 6 - 3) * 0.004
            lon_jitter = -42.8200 + (i % 5 - 2) * 0.004
            req = Request(
                raw_text=text_tmpl + f" [Reg #{i+1}]",
                translated_text="Rural health center and community without electricity; vaccines spoiled.",
                channel="whatsapp" if i % 2 == 0 else "voice",
                language=lang,
                category="electricity",
                urgency_score=round(base_urg, 2),
                lat=lat_jitter,
                lon=lon_jitter,
                region_id=region_mg.id,
                status="clustered",
                created_at=base_time + timedelta(hours=i * 6)
            )
            created_requests.append(req)

        session.add_all(created_requests)
        await session.flush()

        print("📍 Creating Pre-Clustered Demand Hotspots...")
        # Hotspot 1: Badnapur Water
        hotspot_wtr = Hotspot(
            id="hotspot-mh-wtr-04",
            region_id=region_mh.id,
            category="water",
            centroid_lat=19.8762,
            centroid_lon=75.3433,
            request_count=342,
            avg_urgency=0.89,
            cluster_geom_json={
                "type": "Polygon",
                "coordinates": [[[75.33, 19.86], [75.36, 19.86], [75.36, 19.89], [75.33, 19.89], [75.33, 19.86]]]
            }
        )

        # Hotspot 2: State Highway Roads
        hotspot_rds = Hotspot(
            id="hotspot-mh-rd-08",
            region_id=region_mh.id,
            category="roads",
            centroid_lat=19.9200,
            centroid_lon=75.4100,
            request_count=215,
            avg_urgency=0.82,
            cluster_geom_json={
                "type": "Polygon",
                "coordinates": [[[75.39, 19.90], [75.43, 19.90], [75.43, 19.94], [75.39, 19.94], [75.39, 19.90]]]
            }
        )

        # Hotspot 3: Minas Gerais Power
        hotspot_eng = Hotspot(
            id="hotspot-br-eng-01",
            region_id=region_mg.id,
            category="electricity",
            centroid_lat=-16.4300,
            centroid_lon=-42.8200,
            request_count=210,
            avg_urgency=0.74,
            cluster_geom_json={
                "type": "Polygon",
                "coordinates": [[[-42.85, -16.45], [-42.79, -16.45], [-42.79, -16.41], [-42.85, -16.41], [-42.85, -16.45]]]
            }
        )

        session.add_all([hotspot_wtr, hotspot_rds, hotspot_eng])
        await session.flush()

        print("📊 Computing Explainable Priority Scores & Projects...")
        score_wtr = scoring_service.compute_priority_score(
            request_count=342,
            avg_urgency=0.89,
            demographic_vulnerability=0.82,
            infra_deficit=0.78,
            budget_alignment=0.90
        )

        score_rds = scoring_service.compute_priority_score(
            request_count=215,
            avg_urgency=0.82,
            demographic_vulnerability=0.80,
            infra_deficit=0.75,
            budget_alignment=0.88
        )

        score_eng = scoring_service.compute_priority_score(
            request_count=210,
            avg_urgency=0.74,
            demographic_vulnerability=0.68,
            infra_deficit=0.65,
            budget_alignment=0.85
        )

        project_1 = Project(
            id="proj-mh-wtr-1",
            hotspot_id=hotspot_wtr.id,
            region_id=region_mh.id,
            title="Badnapur Feeder Pipeline & Ground Treatment Renewal",
            description="Reconstruction of 8.2km ductile iron supply main from Badnapur reservoir, serving 4 gram panchayats.",
            category="water",
            priority_score=score_wtr["composite_score"],
            priority_breakdown_json=score_wtr,
            status="recommended",
            estimated_cost=460000.0,
            estimated_beneficiaries=14200
        )

        project_2 = Project(
            id="proj-mh-rds-1",
            hotspot_id=hotspot_rds.id,
            region_id=region_mh.id,
            title="State Highway 176 Critical Culvert & Drainage Overhaul",
            description="Reinforced all-weather concrete culvert construction to prevent seasonal monsoon highway washouts.",
            category="roads",
            priority_score=score_rds["composite_score"],
            priority_breakdown_json=score_rds,
            status="recommended",
            estimated_cost=750000.0,
            estimated_beneficiaries=45000
        )

        project_3 = Project(
            id="proj-br-eng-1",
            hotspot_id=hotspot_eng.id,
            region_id=region_mg.id,
            title="Jequitinhonha Solar Microgrid & Health Substation Power",
            description="50kW rural microgrid with lithium battery backup power for regional primary health center.",
            category="electricity",
            priority_score=score_eng["composite_score"],
            priority_breakdown_json=score_eng,
            status="in_progress",
            estimated_cost=440000.0,
            estimated_beneficiaries=8600
        )

        session.add_all([project_1, project_2, project_3])
        await session.flush()

        print("📈 Creating Verifiable Before/After Impact Snapshots...")
        snapshots = [
            ImpactSnapshot(
                id="imp-wtr-1",
                project_id=project_1.id,
                metric_name="Daily Clean Water Access",
                unit="hours/day",
                value_before=1.5,
                value_after=18.5,
                citizen_satisfaction_pct=94.2
            ),
            ImpactSnapshot(
                id="imp-rds-1",
                project_id=project_2.id,
                metric_name="Emergency Transit Time to Hospital",
                unit="minutes",
                value_before=95.0,
                value_after=26.0,
                citizen_satisfaction_pct=96.0
            ),
            ImpactSnapshot(
                id="imp-eng-1",
                project_id=project_3.id,
                metric_name="Weekly Power Blackout Duration",
                unit="hours/week",
                value_before=22.0,
                value_after=0.8,
                citizen_satisfaction_pct=91.5
            )
        ]
        session.add_all(snapshots)

        print("📝 Generating Initial Audit Log Entries...")
        audit = AuditLog(
            actor_id=user_admin.id,
            actor_name=user_admin.name,
            actor_role=user_admin.role,
            entity_type="project",
            entity_id=project_3.id,
            action="status_transition",
            diff_json={"old_status": "funded", "new_status": "in_progress", "note": "Contractor mobilization approved"}
        )
        session.add(audit)

        await session.commit()
        print("✅ Database seeding complete! All regions, users, hotspots, and projects ready for demo.")

if __name__ == "__main__":
    asyncio.run(seed_database())
